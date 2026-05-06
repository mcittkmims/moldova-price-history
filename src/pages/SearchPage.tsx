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

const storePageKey = (storeId: string, page: number) => `${storeId}:${page}`;

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
  const [searchSession, setSearchSession] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<ProductCategoryOption[]>(categories);
  const [storeOptions, setStoreOptions] = useState<StoreOption[]>(stores);
  const [searchSortOptions, setSearchSortOptions] = useState<SortOption[]>(sortOptions);

  // Track individual store/page requests so late responses from the same search stay valid.
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Search generation changes only when filters/sort change, not when loading another page.
  const generationRef = useRef(0);
  const activeSearchKeyRef = useRef("");
  const requestedPagesRef = useRef<Set<string>>(new Set());
  const exhaustedStoresRef = useRef<Set<string>>(new Set());
  const lastLoadTriggerCountRef = useRef<number | null>(null);

  const loading = products.length === 0 && pendingRequests.size > 0;
  const loadingMore = products.length > 0 && pendingRequests.size > 0;

  // Infinite scroll observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (loading || !node) return;

      observerRef.current = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting || !hasMore) {
          return;
        }

        // Only allow one page advance for a given rendered list size.
        // This prevents the observer from queuing several pages while the
        // same last card remains visible and requests are still in flight.
        if (lastLoadTriggerCountRef.current === products.length) {
          return;
        }

        lastLoadTriggerCountRef.current = products.length;
        setPage((prev) => prev + 1);
      });
      observerRef.current.observe(node);
    },
    [hasMore, loading, products.length],
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

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
      setSearchSession((prev) => prev + 1);
      setPage(1);
      setHasMore(true);
    }, 1000);
    return () => window.clearTimeout(id);
  }, [filters, sort]);

  // Main fetch effect — requests the current global page for each store.
  useEffect(() => {
    const query = searchFilters.query.trim();

    if (!query) {
      activeSearchKeyRef.current = "";
      generationRef.current += 1;
      requestedPagesRef.current = new Set();
      exhaustedStoresRef.current = new Set();
      lastLoadTriggerCountRef.current = null;
      setProducts([]);
      setPendingRequests(new Set());
      setHasMore(false);
      return;
    }

    const targetStores =
      searchFilters.store !== "All"
        ? [searchFilters.store]
        : STORE_IDS;
    const searchKey = [
      searchSession,
      query,
      searchFilters.store,
      searchFilters.category,
      searchSort,
    ].join("::");
    const isNewSearch = activeSearchKeyRef.current !== searchKey;

    if (isNewSearch) {
      activeSearchKeyRef.current = searchKey;
      generationRef.current += 1;
      requestedPagesRef.current = new Set();
      exhaustedStoresRef.current = new Set();
      lastLoadTriggerCountRef.current = null;
      setProducts([]);
      setPendingRequests(new Set());
      setHasMore(true);

      if (page !== 1) {
        setPage(1);
        return;
      }
    }

    const generation = generationRef.current;
    const updateHasMore = () =>
      setHasMore(targetStores.some((storeId) => !exhaustedStoresRef.current.has(storeId)));

    let dispatchedAny = false;

    targetStores.forEach((storeId) => {
      if (exhaustedStoresRef.current.has(storeId)) {
        return;
      }

      const requestKey = storePageKey(storeId, page);
      if (requestedPagesRef.current.has(requestKey)) {
        return;
      }

      requestedPagesRef.current.add(requestKey);
      dispatchedAny = true;

      setPendingRequests((prev) => {
        const next = new Set(prev);
        next.add(requestKey);
        return next;
      });

      productService
        .searchProductsForStore(searchFilters, searchSort, page, storeId)
        .then((result) => {
          if (
            generationRef.current !== generation ||
            activeSearchKeyRef.current !== searchKey
          ) {
            return;
          }

          if (result.length < PAGE_SIZE_PER_STORE) {
            exhaustedStoresRef.current.add(storeId);
          }

          setProducts((prev) => mergeAndSort(prev, result, searchSort));
          setPendingRequests((prev) => {
            const next = new Set(prev);
            next.delete(requestKey);
            return next;
          });
          updateHasMore();
        })
        .catch(() => {
          if (
            generationRef.current !== generation ||
            activeSearchKeyRef.current !== searchKey
          ) {
            return;
          }

          exhaustedStoresRef.current.add(storeId);
          setPendingRequests((prev) => {
            const next = new Set(prev);
            next.delete(requestKey);
            return next;
          });
          updateHasMore();
        });
    });

    if (!dispatchedAny) {
      updateHasMore();
    }
  }, [page, searchFilters, searchSession, searchSort]);

  const handleSortChange = (nextSort: ProductSort) => {
    setSort(nextSort);
    setDefaultSort(nextSort);
  };

  const handleSearch = () => {
    setSearchFilters(filters);
    setSearchSort(sort);
    setSearchSession((prev) => prev + 1);
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
