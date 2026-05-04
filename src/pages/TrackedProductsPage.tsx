import { SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DistributionChart } from "../components/charts/DistributionChart";
import { ProductCard } from "../components/products/ProductCard";
import { useAppState } from "../context/AppStateContext";
import { categories, productService, sortOptions, stores } from "../services/productService";
import type {
  Product,
  ProductCategoryOption,
  ProductCategory,
  SortOption,
  ProductSort,
  StoreId,
  StoreOption,
  StoreName,
} from "../types/product";
import { formatMdl, getPriceDrop, getTrackedStats } from "../utils/pricing";

type TrackedFilter = {
  store: "All" | StoreId;
  category: "All" | ProductCategory;
};

export function TrackedProductsPage() {
  const { trackedIds, isTracked, toggleTracked } = useAppState();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryOptions, setCategoryOptions] =
    useState<ProductCategoryOption[]>(categories);
  const [storeOptions, setStoreOptions] = useState<StoreOption[]>(stores);
  const [trackedSortOptions, setTrackedSortOptions] =
    useState<SortOption[]>(sortOptions);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TrackedFilter>({
    store: "All",
    category: "All",
  });
  const [sort, setSort] = useState<ProductSort>("default");
  const [distribution, setDistribution] = useState<"store" | "category">(
    "store",
  );

  useEffect(() => {
    let active = true;
    setLoading(true);

    productService.getProductsByIds(trackedIds).then((result) => {
      if (active) {
        setProducts(result);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [trackedIds]);

  useEffect(() => {
    let active = true;
    Promise.all([
      productService.getCategories(),
      productService.getStores(),
      productService.getSortOptions(),
    ]).then(([nextCategories, nextStores, nextSortOptions]) => {
      if (active) {
        setCategoryOptions(nextCategories);
        setStoreOptions(nextStores);
        setTrackedSortOptions(nextSortOptions);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const visibleProducts = useMemo(() => {
    const comparePrice = (a: Product, b: Product, ascending: boolean) => {
      const aPriced = a.currentPrice > 0;
      const bPriced = b.currentPrice > 0;
      if (aPriced !== bPriced) {
        return aPriced ? -1 : 1;
      }
      return ascending
        ? a.currentPrice - b.currentPrice
        : b.currentPrice - a.currentPrice;
    };
    const filtered = products.filter((product) => {
      const matchesStore =
        filter.store === "All" ||
        product.storeId === filter.store ||
        product.store === filter.store;
      const category = categoryOptions.find((item) => item.id === filter.category);
      const matchesCategory =
        filter.category === "All" ||
        product.category === filter.category ||
        product.category === category?.name;

      return matchesStore && matchesCategory;
    });

    if (sort === "price_asc") {
      return [...filtered].sort((a, b) => comparePrice(a, b, true));
    }

    if (sort === "price_desc") {
      return [...filtered].sort((a, b) => comparePrice(a, b, false));
    }

    return filtered;
  }, [categoryOptions, filter, products, sort]);

  const stats = useMemo(() => getTrackedStats(products), [products]);

  const distributionData = useMemo(() => {
      const source =
      distribution === "store"
        ? storeOptions
        : categoryOptions;
    return source
      .map((item: ProductCategoryOption) => ({
        name: item.name,
        count: products.filter((product) =>
          distribution === "store"
            ? product.storeId === item.id || product.store === item.name
            : product.category === item.id || product.category === item.name,
        ).length,
      }))
      .filter((item) => item.count > 0);
  }, [categoryOptions, distribution, products, storeOptions]);

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">
            Tracked products
          </h1>
        </div>
        <div className="text-sm text-ink-500 dark:text-neutral-400">
          {loading ? "Loading" : `${visibleProducts.length} shown`}
        </div>
      </div>

      <section className="rounded-lg border border-ink-200 bg-white shadow-soft dark:border-neutral-800 dark:bg-[#171717]">
        <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="border-b border-ink-200 p-5 xl:border-b-0 xl:border-r dark:border-neutral-800">
            <h2 className="text-lg font-semibold">Tracked summary</h2>
            <dl className="mt-4 divide-y divide-ink-200 text-sm dark:divide-neutral-800">
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-ink-500 dark:text-neutral-400">
                  Total tracked items
                </dt>
                <dd className="font-medium">{stats.total}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-ink-500 dark:text-neutral-400">
                  Lowest current price
                </dt>
                <dd className="font-medium">{formatMdl(stats.lowestPrice)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-ink-500 dark:text-neutral-400">
                  Highest current price
                </dt>
                <dd className="font-medium">{formatMdl(stats.highestPrice)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-ink-500 dark:text-neutral-400">
                  Biggest price drop
                </dt>
                <dd className="text-right font-medium">
                  {stats.biggestDrop
                    ? `${formatMdl(getPriceDrop(stats.biggestDrop))} on ${stats.biggestDrop.title}`
                    : formatMdl(0)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <dt className="text-ink-500 dark:text-neutral-400">
                  Average drop
                </dt>
                <dd className="font-medium">{formatMdl(stats.averageDrop)}</dd>
              </div>
            </dl>
          </div>

          <div className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Distribution</h2>
              <div className="flex rounded-md border border-ink-200 dark:border-neutral-700">
                <button
                  type="button"
                  onClick={() => setDistribution("store")}
                  className={[
                    "h-8 px-3 text-sm transition-colors",
                    distribution === "store"
                      ? "bg-ink-100 text-ink-900 dark:bg-neutral-800 dark:text-neutral-100"
                      : "text-ink-600 hover:bg-ink-50 dark:text-neutral-400 dark:hover:bg-neutral-800",
                  ].join(" ")}
                >
                  Store
                </button>
                <button
                  type="button"
                  onClick={() => setDistribution("category")}
                  className={[
                    "h-8 border-l border-ink-200 px-3 text-sm transition-colors dark:border-neutral-700",
                    distribution === "category"
                      ? "bg-ink-100 text-ink-900 dark:bg-neutral-800 dark:text-neutral-100"
                      : "text-ink-600 hover:bg-ink-50 dark:text-neutral-400 dark:hover:bg-neutral-800",
                  ].join(" ")}
                >
                  Category
                </button>
              </div>
            </div>
            <DistributionChart data={distributionData} />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-ink-200 bg-white p-4 shadow-soft dark:border-neutral-800 dark:bg-[#171717]">
        <div className="grid gap-4 xl:grid-cols-[minmax(260px,1fr)_180px_180px_170px]">
          <div className="flex items-center gap-2 text-sm font-medium">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </div>
          <label className="block">
            <div className="mb-2 text-sm font-medium">Store</div>
            <select
              value={filter.store}
              onChange={(event) =>
                setFilter({
                  ...filter,
                  store: event.target.value as TrackedFilter["store"],
                })
              }
              className="h-10 w-full rounded-md border border-ink-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-[#1a1a1a]"
            >
              <option value="All">All stores</option>
              {storeOptions.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <div className="mb-2 text-sm font-medium">Category</div>
            <select
              value={filter.category}
              onChange={(event) =>
                setFilter({
                  ...filter,
                  category: event.target.value as TrackedFilter["category"],
                })
              }
              className="h-10 w-full rounded-md border border-ink-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-[#1a1a1a]"
            >
              <option value="All">All categories</option>
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <div className="mb-2 text-sm font-medium">Sort</div>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as ProductSort)}
              className="h-10 w-full rounded-md border border-ink-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-[#1a1a1a]"
            >
              {trackedSortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            tracked={isTracked(product.id)}
            onToggleTracked={toggleTracked}
            compact
          />
        ))}
      </div>

      {!loading && products.length === 0 ? (
        <div className="rounded-lg border border-ink-200 bg-white p-6 text-sm text-ink-600 shadow-soft dark:border-neutral-800 dark:bg-[#171717] dark:text-neutral-300">
          No tracked products yet. Search products and use Track to save them.
        </div>
      ) : null}
    </div>
  );
}
