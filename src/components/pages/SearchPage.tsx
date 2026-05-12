"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { ProductCard } from "../products/ProductCard";
import { SearchControls } from "../products/SearchControls";
import { useAppState } from "../../context/AppStateContext";
import { useLanguage } from "../../context/LanguageContext";
import { toErrorMessage } from "../../services/apiClient";
import { categories, classifySearchInput, productService, sortOptions, stores } from "../../services/productService";
import type {
  Product,
  ProductCategoryOption,
  ProductFilters,
  ProductSort,
  SortOption,
  StoreOption,
} from "../../types/product";

const STORE_IDS = stores.map((store) => store.id);
const PAGE_SIZE_PER_STORE = 4;

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

function mergeAndSort(prev: Product[], incoming: Product[], sort: ProductSort): Product[] {
  const map = new Map<string, Product>();
  for (const product of prev) map.set(product.id, product);
  for (const product of incoming) map.set(product.id, product);
  const combined = Array.from(map.values());

  if (sort === "price_asc") {
    return combined.sort((left, right) => {
      const leftPriced = left.currentPrice != null && left.currentPrice > 0;
      const rightPriced = right.currentPrice != null && right.currentPrice > 0;
      if (leftPriced !== rightPriced) return leftPriced ? -1 : 1;
      return (left.currentPrice ?? 0) - (right.currentPrice ?? 0);
    });
  }

  if (sort === "price_desc") {
    return combined.sort((left, right) => {
      const leftPriced = left.currentPrice != null && left.currentPrice > 0;
      const rightPriced = right.currentPrice != null && right.currentPrice > 0;
      if (leftPriced !== rightPriced) return leftPriced ? -1 : 1;
      return (right.currentPrice ?? 0) - (left.currentPrice ?? 0);
    });
  }

  return combined;
}

export function SearchPage() {
  const router = useRouter();
  const { defaultSort, setDefaultSort } = useAppState();
  const { tr } = useLanguage();
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const [searchFilters, setSearchFilters] = useState<ProductFilters>(initialFilters);
  const [sort, setSort] = useState<ProductSort>(validSort(defaultSort));
  const [searchSort, setSearchSort] = useState<ProductSort>(validSort(defaultSort));
  const [searchSession, setSearchSession] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [rawCategories, setRawCategories] = useState<ProductCategoryOption[]>(categories);
  const [storeOptions, setStoreOptions] = useState<StoreOption[]>(stores);
  const [rawSortOptions, setRawSortOptions] = useState<SortOption[]>(sortOptions);

  const categoryOptions = rawCategories.map((c) => ({
    ...c,
    name: tr.category_names[c.id] ?? c.name,
  }));
  const searchSortOptions = rawSortOptions.map((s) => ({
    ...s,
    name: tr.sort_names[s.id] ?? s.name,
  }));
  const [pendingRequests, setPendingRequests] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [resolvingUrl, setResolvingUrl] = useState(false);

  const generationRef = useRef(0);
  const activeSearchKeyRef = useRef("");
  const requestedPagesRef = useRef<Set<string>>(new Set());
  const exhaustedStoresRef = useRef<Set<string>>(new Set());
  const lastLoadTriggerCountRef = useRef<number | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const loading = resolvingUrl || (products.length === 0 && pendingRequests.size > 0);
  const loadingMore = !resolvingUrl && products.length > 0 && pendingRequests.size > 0;

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (loading || !node) return;

      observerRef.current = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting || !hasMore) {
          return;
        }

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
    productService
      .getCategories()
      .then((result) => {
        if (active) {
          setRawCategories(result);
        }
      })
      .catch((error) => {
        console.error(error);
        if (active) {
          setFilterError(tr.search_categories_failed);
        }
      });
    return () => {
      active = false;
    };
  }, [tr.search_categories_failed]);

  useEffect(() => {
    let active = true;
    Promise.all([productService.getStores(), productService.getSortOptions()])
      .then(([nextStores, nextSortOptions]) => {
        if (active) {
          setStoreOptions(nextStores);
          setRawSortOptions(nextSortOptions);
        }
      })
      .catch((error) => {
        console.error(error);
        if (active) {
          setFilterError(tr.search_filters_failed);
        }
      });
    return () => {
      active = false;
    };
  }, [tr.search_filters_failed]);

  useEffect(() => {
    if (classifySearchInput(filters.query) !== "keyword") {
      return;
    }
    const id = window.setTimeout(() => {
      setSearchFilters(filters);
      setSearchSort(sort);
      setSearchSession((prev) => prev + 1);
      setPage(1);
      setHasMore(true);
    }, 1000);
    return () => window.clearTimeout(id);
  }, [filters, sort]);

  useEffect(() => {
    const query = searchFilters.query.trim();
    const mode = classifySearchInput(query);

    if (mode === "empty") {
      activeSearchKeyRef.current = "";
      generationRef.current += 1;
      requestedPagesRef.current = new Set();
      exhaustedStoresRef.current = new Set();
      lastLoadTriggerCountRef.current = null;
      setProducts([]);
      setPendingRequests(new Set());
      setHasMore(false);
      setSearchError(null);
      setResolvingUrl(false);
      return;
    }

    const targetStores = searchFilters.store !== "All" ? [searchFilters.store] : STORE_IDS;
    const searchKey = mode === "keyword"
      ? [
          searchSession,
          query,
          searchFilters.store,
          searchFilters.category,
          searchSort,
        ].join("::")
      : [searchSession, query, mode].join("::");
    const isNewSearch = activeSearchKeyRef.current !== searchKey;

    if (isNewSearch) {
      activeSearchKeyRef.current = searchKey;
      generationRef.current += 1;
      requestedPagesRef.current = new Set();
      exhaustedStoresRef.current = new Set();
      lastLoadTriggerCountRef.current = null;
      setProducts([]);
      setPendingRequests(new Set());
      setHasMore(mode === "keyword");
      setSearchError(null);
      setResolvingUrl(false);

      if (page !== 1) {
        setPage(1);
        return;
      }
    }

    if (mode !== "keyword" && !isNewSearch) {
      return;
    }

    const generation = generationRef.current;

    if (mode === "unsupported_url") {
      setSearchError(tr.search_unsupported_url);
      setHasMore(false);
      return;
    }

    if (mode === "supported_url") {
      setResolvingUrl(true);
      setHasMore(false);
      productService
        .resolveProductUrl(query)
        .then((product) => {
          if (
            generationRef.current !== generation ||
            activeSearchKeyRef.current !== searchKey
          ) {
            return;
          }

          router.push(`/products/${encodeURIComponent(product.slug)}`);
        })
        .catch((error) => {
          if (
            generationRef.current !== generation ||
            activeSearchKeyRef.current !== searchKey
          ) {
            return;
          }

          setResolvingUrl(false);
          setSearchError(toErrorMessage(error, tr.search_resolve_failed));
        });
      return;
    }

    setResolvingUrl(false);
    setSearchError(null);
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
        .catch((error) => {
          if (
            generationRef.current !== generation ||
            activeSearchKeyRef.current !== searchKey
          ) {
            return;
          }

          exhaustedStoresRef.current.add(storeId);
          setSearchError((current) => current ?? (
            targetStores.length > 1
              ? tr.search_some_failed
              : toErrorMessage(error, tr.search_resolve_failed)
          ));
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
  }, [page, searchFilters, searchSession, searchSort, tr]);

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
          <h1 className="text-2xl font-semibold tracking-normal">{tr.search_title}</h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-neutral-400">
            {tr.search_subtitle}
          </p>
        </div>
        <div className="text-sm text-ink-500 dark:text-neutral-400">
          {resolvingUrl
            ? tr.search_resolving
            : loading
            ? tr.search_searching
            : tr.search_results(products.length)}
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

      {filterError ? (
        <div className="rounded-lg border border-rust-100 bg-rust-50 px-4 py-3 text-sm text-rust-700 dark:border-rust-700 dark:bg-[#2b170d] dark:text-rust-100">
          {filterError}
        </div>
      ) : null}

      {searchError ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200">
          {searchError}
        </div>
      ) : null}

      {loading && products.length === 0 ? (
        <div className="grid min-h-[260px] place-items-center rounded-lg border border-ink-200 bg-white p-8 text-center shadow-soft dark:border-neutral-800 dark:bg-[#171717]">
          <div>
            <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-moss-700 dark:text-moss-500" />
            <div className="mt-4 text-sm font-medium">
              {resolvingUrl ? tr.search_opening : tr.search_checking}
            </div>
            <div className="mt-1 text-sm text-ink-500 dark:text-neutral-400">
              {resolvingUrl ? tr.search_opening_sub : tr.search_checking_sub}
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

      {loadingMore ? (
        <div className="flex justify-center py-6">
          <LoaderCircle className="h-6 w-6 animate-spin text-moss-700 dark:text-moss-500" />
        </div>
      ) : null}

      {!loading && !searchError && searchFilters.query.trim() && products.length === 0 ? (
        <div className="rounded-lg border border-ink-200 bg-white p-6 text-sm text-ink-600 shadow-soft dark:border-neutral-800 dark:bg-[#171717] dark:text-neutral-300">
          {tr.search_no_results}
        </div>
      ) : null}
    </div>
  );
}
