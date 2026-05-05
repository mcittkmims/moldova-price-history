import { useCallback, useEffect, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { ProductCard } from "../components/products/ProductCard";
import { SearchControls } from "../components/products/SearchControls";
import { useAppState } from "../context/AppStateContext";
import { categories, productService, sortOptions, stores } from "../services/productService";
import type {
  Product,
  ProductCategoryOption,
  ProductFilters,
  ProductSort,
  SortOption,
  StoreOption,
} from "../types/product";

const STORE_IDS = stores.map((s) => s.id);
const PAGE_SIZE_PER_STORE = 4; // how many items to request per store per page

const initialFilters: ProductFilters = {
  query: "",
  store: "All",
  category: "All",
};

const validSort = (sort: ProductSort): ProductSort =>
  ["default", "price_asc", "price_desc", "popularity"].includes(sort)
    ? sort
    : "default";

/** Merge new products into existing list, dedup by id, then sort globally. */
function mergeAndSort(prev: Product[], incoming: Product[], sort: ProductSort): Product[] {
  const map = new Map<string, Product>();
  for (const p of prev) map.set(p.id, p);
  for (const p of incoming) map.set(p.id, p);
  const combined = Array.from(map.values());

  if (sort === "price_asc") {
    return combined.sort((a, b) => {
      const aPriced = a.currentPrice != null && a.currentPrice > 0;
      const bPriced = b.currentPrice != null && b.currentPrice > 0;
      if (aPriced !== bPriced) return aPriced ? -1 : 1;
      return (a.currentPrice ?? 0) - (b.currentPrice ?? 0);
    });
  }
  if (sort === "price_desc") {
    return combined.sort((a, b) => {
      const aPriced = a.currentPrice != null && a.currentPrice > 0;
      const bPriced = b.currentPrice != null && b.currentPrice > 0;
      if (aPriced !== bPriced) return aPriced ? -1 : 1;
      return (b.currentPrice ?? 0) - (a.currentPrice ?? 0);
    });
  }
  return combined;
}

export function SearchPage() {
  const { defaultSort, setDefaultSort } = useAppState();
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const [searchFilters, setSearchFilters] = useState<ProductFilters>(initialFilters);
  const [sort, setSort] = useState<ProductSort>(validSort(defaultSort));
  const [searchSort, setSearchSort] = useState<ProductSort>(validSort(defaultSort));
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<ProductCategoryOption[]>(categories);
  const [storeOptions, setStoreOptions] = useState<StoreOption[]>(stores);
  const [searchSortOptions, setSearchSortOptions] = useState<SortOption[]>(sortOptions);

  // Loading state: which stores are still in-flight for the current batch
  const [pendingStores, setPendingStores] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Generation counter — incremented on every new search/page so stale fetches self-discard
  const generationRef = useRef(0);

  const loading = page === 1 && pendingStores.size > 0;
  const loadingMore = page > 1 && pendingStores.size > 0;

  // Infinite scroll observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      // Only block during the initial full-page load (page 1 spinner).
      // During loadingMore we still allow scrolling — the generation counter
      // handles any race conditions from overlapping page fetches.
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && pendingStores.size === 0) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, pendingStores.size],
  );

  useEffect(() => {
    let active = true;
    productService.getCategories().then((result) => {
      if (active) setCategoryOptions(result);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([productService.getStores(), productService.getSortOptions()]).then(
      ([nextStores, nextSortOptions]) => {
        if (active) {
          setStoreOptions(nextStores);
          setSearchSortOptions(nextSortOptions);
        }
      },
    );
    return () => { active = false; };
  }, []);

  // Debounce filter/sort changes → reset to page 1
  useEffect(() => {
    const id = window.setTimeout(() => {
      setSearchFilters(filters);
      setSearchSort(sort);
      setPage(1);
      setHasMore(true);
    }, 1000);
    return () => window.clearTimeout(id);
  }, [filters, sort]);

  // Main fetch effect — fires per-store requests in parallel
  useEffect(() => {
    if (!searchFilters.query.trim()) {
      setProducts([]);
      setPendingStores(new Set());
      return;
    }

    // Bump the generation so any still-running fetches from a previous search/page
    // will see their generation is stale and silently discard their results.
    const generation = ++generationRef.current;

    // Which store IDs to query: all, or just the one the user filtered to
    const targetStores =
      searchFilters.store !== "All"
        ? [searchFilters.store]
        : STORE_IDS;

    // Clear the product list on a fresh search (page 1), keep it for scroll pages
    if (page === 1) {
      setProducts([]);
    }
    setPendingStores(new Set(targetStores));

    let anyStoreHadFullPage = false;

    targetStores.forEach((storeId) => {
      productService
        .searchProductsForStore(searchFilters, searchSort, page, storeId)
        .then((result) => {
          // Discard if a newer search/page has already started
          if (generationRef.current !== generation) return;

          if (result.length >= PAGE_SIZE_PER_STORE) {
            anyStoreHadFullPage = true;
          }

          setProducts((prev) => mergeAndSort(prev, result, searchSort));
          setPendingStores((prev) => {
            const next = new Set(prev);
            next.delete(storeId);
            // Once all stores have settled, decide hasMore
            if (next.size === 0) {
              setHasMore(anyStoreHadFullPage);
            }
            return next;
          });
        })
        .catch(() => {
          if (generationRef.current !== generation) return;
          // On error for one store, just mark it done — others continue
          setPendingStores((prev) => {
            const next = new Set(prev);
            next.delete(storeId);
            if (next.size === 0) {
              setHasMore(anyStoreHadFullPage);
            }
            return next;
          });
        });
    });
  }, [searchFilters, searchSort, page]);

  const handleSortChange = (nextSort: ProductSort) => {
    setSort(nextSort);
    setDefaultSort(nextSort);
  };

  const handleSearch = () => {
    setSearchFilters(filters);
    setSearchSort(sort);
    setPage(1);
    setHasMore(true);
  };

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1500px] space-y-5 overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Search</h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-neutral-400">
            Find products from Moldova stores and add them to your tracked list.
          </p>
        </div>
        <div className="text-sm text-ink-500 dark:text-neutral-400">
          {loading
            ? "Searching…"
            : `${products.length} result${products.length === 1 ? "" : "s"}`}
        </div>
      </div>

      <SearchControls
        filters={filters}
        sort={sort}
        stores={storeOptions}
        categories={categoryOptions}
        sortOptions={searchSortOptions}
        onFiltersChange={setFilters}
        onSortChange={handleSortChange}
        onSearch={handleSearch}
      />

      {loading && products.length === 0 ? (
        <div className="grid min-h-[260px] place-items-center rounded-lg border border-ink-200 bg-white p-8 text-center shadow-soft dark:border-neutral-800 dark:bg-[#171717]">
          <div>
            <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-moss-700 dark:text-moss-500" />
            <div className="mt-4 text-sm font-medium">Searching products</div>
            <div className="mt-1 text-sm text-ink-500 dark:text-neutral-400">
              Checking Moldova stores for the latest matches.
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {products.map((product, index) => {
            const isLast = index === products.length - 1;
            return (
              <div key={product.id} ref={isLast ? lastElementRef : null} className="min-w-0 overflow-hidden">
                <ProductCard product={product} />
              </div>
            );
          })}
        </div>
      )}

      {loadingMore && (
        <div className="py-6 flex justify-center">
          <LoaderCircle className="h-6 w-6 animate-spin text-moss-700 dark:text-moss-500" />
        </div>
      )}

      {!loading && products.length === 0 ? (
        <div className="rounded-lg border border-ink-200 bg-white p-6 text-sm text-ink-600 shadow-soft dark:border-neutral-800 dark:bg-[#171717] dark:text-neutral-300">
          No matching products. Try a store name, category, model, or a known product URL.
        </div>
      ) : null}
    </div>
  );
}
