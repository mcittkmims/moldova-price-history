import { useEffect, useState } from "react";
import { ProductCard } from "../components/products/ProductCard";
import { SearchControls } from "../components/products/SearchControls";
import { useAppState } from "../context/AppStateContext";
import { categories, productService, stores } from "../services/productService";
import type { Product, ProductFilters, ProductSort } from "../types/product";

const initialFilters: ProductFilters = {
  query: "",
  store: "All",
  category: "All",
};

export function SearchPage() {
  const { defaultSort, setDefaultSort, isTracked, toggleTracked } =
    useAppState();
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const [sort, setSort] = useState<ProductSort>(defaultSort);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    productService.searchProducts(filters, sort).then((result) => {
      if (active) {
        setProducts(result);
        setLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [filters, sort]);

  const handleSortChange = (nextSort: ProductSort) => {
    setSort(nextSort);
    setDefaultSort(nextSort);
  };

  return (
    <div className="space-y-5">
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
        stores={stores}
        categories={categories}
        onFiltersChange={setFilters}
        onSortChange={handleSortChange}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            tracked={isTracked(product.id)}
            onToggleTracked={toggleTracked}
          />
        ))}
      </div>

      {!loading && products.length === 0 ? (
        <div className="rounded-lg border border-ink-200 bg-white p-6 text-sm text-ink-600 shadow-soft dark:border-neutral-800 dark:bg-[#171717] dark:text-neutral-300">
          No matching products. Try a store name, category, model, or a known
          product URL.
        </div>
      ) : null}
    </div>
  );
}
