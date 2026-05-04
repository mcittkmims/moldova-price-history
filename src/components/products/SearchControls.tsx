import { Search } from "lucide-react";
import type {
  ProductCategoryOption,
  ProductFilters,
  SortOption,
  ProductSort,
  StoreOption,
} from "../../types/product";

type SearchControlsProps = {
  filters: ProductFilters;
  sort: ProductSort;
  stores: StoreOption[];
  categories: ProductCategoryOption[];
  sortOptions: SortOption[];
  onFiltersChange: (filters: ProductFilters) => void;
  onSortChange: (sort: ProductSort) => void;
  onSearch: () => void;
};

export function SearchControls({
  filters,
  sort,
  stores,
  categories,
  sortOptions,
  onFiltersChange,
  onSortChange,
  onSearch,
}: SearchControlsProps) {
  return (
    <form
      className="rounded-lg border border-ink-200 bg-white p-4 shadow-soft dark:border-neutral-800 dark:bg-[#171717]"
      onSubmit={(event) => {
        event.preventDefault();
        onSearch();
      }}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_180px_180px_170px]">
        <label className="block">
          <div className="mb-2 text-sm font-medium">Search</div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500 dark:text-neutral-400" />
            <input
              value={filters.query}
              onChange={(event) =>
                onFiltersChange({ ...filters, query: event.target.value })
              }
              placeholder="Keyword or product link"
              className="h-10 w-full rounded-md border border-ink-300 bg-white pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-500 dark:border-neutral-700 dark:bg-[#1a1a1a] dark:text-neutral-100 dark:placeholder:text-neutral-500"
            />
          </div>
        </label>

        <label className="block">
          <div className="mb-2 text-sm font-medium">Store</div>
          <select
            value={filters.store}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                store: event.target.value as ProductFilters["store"],
              })
            }
            className="h-10 w-full rounded-md border border-ink-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-[#1a1a1a]"
          >
            <option value="All">All stores</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <div className="mb-2 text-sm font-medium">Category</div>
          <select
            value={filters.category}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                category: event.target.value as ProductFilters["category"],
              })
            }
            className="h-10 w-full rounded-md border border-ink-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-[#1a1a1a]"
          >
            <option value="All">All categories</option>
            {categories.map((category) => (
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
            onChange={(event) => onSortChange(event.target.value as ProductSort)}
            className="h-10 w-full rounded-md border border-ink-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-[#1a1a1a]"
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </form>
  );
}
