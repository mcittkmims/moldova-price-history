import { useEffect, useState } from "react";
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

const initialFilters: ProductFilters = {
  query: "",
  store: "All",
  category: "All",
};

const validSort = (sort: ProductSort): ProductSort =>
  [
    "default",
    "price_asc",
    "price_desc",
    "popularity",
  ].includes(sort)
    ? sort
    : "default";

export function SearchPage() {
  const { defaultSort, setDefaultSort, isTracked, toggleTracked } =
    useAppState();
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const [searchFilters, setSearchFilters] =
    useState<ProductFilters>(initialFilters);
  const [sort, setSort] = useState<ProductSort>(validSort(defaultSort));
  const [searchSort, setSearchSort] = useState<ProductSort>(
    validSort(defaultSort),
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryOptions, setCategoryOptions] =
    useState<ProductCategoryOption[]>(categories);
  const [storeOptions, setStoreOptions] = useState<StoreOption[]>(stores);
  const [searchSortOptions, setSearchSortOptions] =
    useState<SortOption[]>(sortOptions);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    productService.getCategories().then((result) => {
      if (active) {
        setCategoryOptions(result);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      productService.getStores(),
      productService.getSortOptions(),
    ]).then(([nextStores, nextSortOptions]) => {
      if (active) {
        setStoreOptions(nextStores);
        setSearchSortOptions(nextSortOptions);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearchFilters(filters);
      setSearchSort(sort);
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [filters, sort]);

  useEffect(() => {
    let active = true;

    if (!searchFilters.query.trim()) {
      setProducts([]);
      setLoading(false);
      return () => {
        active = false;
      };
    }

    setLoading(true);

    productService
      .searchProducts(searchFilters, searchSort)
      .then((result) => {
        if (active) {
          setProducts(result);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [searchFilters, searchSort]);

  const handleSortChange = (nextSort: ProductSort) => {
    setSort(nextSort);
    setDefaultSort(nextSort);
  };

  const handleSearch = () => {
    setSearchFilters(filters);
    setSearchSort(sort);
  };

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Search</h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-neutral-400">
            Find products from Moldova stores and add them to your tracked list.
          </p>
        </div>
        <div className="text-sm text-ink-500 dark:text-neutral-400">
          {loading ? "Searching" : `${products.length} result${products.length === 1 ? "" : "s"}`}
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

      {loading ? (
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
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              tracked={isTracked(product.id)}
              onToggleTracked={toggleTracked}
            />
          ))}
        </div>
      )}

      {!loading && products.length === 0 ? (
        <div className="rounded-lg border border-ink-200 bg-white p-6 text-sm text-ink-600 shadow-soft dark:border-neutral-800 dark:bg-[#171717] dark:text-neutral-300">
          No matching products. Try a store name, category, model, or a known
          product URL.
        </div>
      ) : null}
    </div>
  );
}
