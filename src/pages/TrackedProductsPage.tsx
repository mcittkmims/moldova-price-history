import { SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DistributionChart } from "../components/charts/DistributionChart";
import { ProductCard } from "../components/products/ProductCard";
import { useAppState } from "../context/AppStateContext";
import { categories, productService, stores } from "../services/productService";
import type {
  Product,
  ProductCategory,
  ProductSort,
  StoreName,
} from "../types/product";
import { formatMdl, getPriceDrop, getTrackedStats } from "../utils/pricing";

type TrackedFilter = {
  store: "All" | StoreName;
  category: "All" | ProductCategory;
};

export function TrackedProductsPage() {
  const { trackedIds, isTracked, toggleTracked } = useAppState();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TrackedFilter>({
    store: "All",
    category: "All",
  });
  const [sort, setSort] = useState<ProductSort>("drop");
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

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesStore = filter.store === "All" || product.store === filter.store;
      const matchesCategory =
        filter.category === "All" || product.category === filter.category;

      return matchesStore && matchesCategory;
    });

    if (sort === "price-low") {
      return [...filtered].sort((a, b) => a.currentPrice - b.currentPrice);
    }

    if (sort === "price-high") {
      return [...filtered].sort((a, b) => b.currentPrice - a.currentPrice);
    }

    if (sort === "drop") {
      return [...filtered].sort((a, b) => getPriceDrop(b) - getPriceDrop(a));
    }

    return filtered;
  }, [filter, products, sort]);

  const stats = useMemo(() => getTrackedStats(products), [products]);

  const distributionData = useMemo(() => {
    const source = distribution === "store" ? stores : categories;
    return source
      .map((name) => ({
        name,
        count: products.filter((product) =>
          distribution === "store"
            ? product.store === name
            : product.category === name,
        ).length,
      }))
      .filter((item) => item.count > 0);
  }, [distribution, products]);

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
              {stores.map((store) => (
                <option key={store} value={store}>
                  {store}
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
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
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
              <option value="drop">Biggest drop</option>
              <option value="price-low">Lowest price</option>
              <option value="price-high">Highest price</option>
              <option value="relevance">Saved order</option>
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
