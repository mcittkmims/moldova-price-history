export type ThemeMode = "light" | "dark";

export type ProductCategory = string;

export type ProductCategoryOption = {
  id: string;
  name: string;
};

export type StoreId = string;

export type StoreOption = {
  id: StoreId;
  name: string;
  logoPath: string;
  faviconPath: string;
};

export type StoreName = string;

export type SortOption = {
  id: ProductSort;
  name: string;
};

export type PricePoint = {
  date: string;
  price: number;
};

export type ProductHistory = {
  history: PricePoint[];
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  brand?: string | null;
  storeId?: StoreId;
  store: StoreName;
  category: ProductCategory;
  currentPrice: number | null;
  previousPrice: number | null;
  currency: "MDL";

  availability: "In stock" | "Low stock" | "Preorder" | "Out of stock" | "Unknown";
  url: string;
  imageTone: string;
  imageUrl?: string | null;
  specs: string[];
  lastChecked: string;
};

export type ProductFilters = {
  query: string;
  store: "All" | StoreId;
  category: "All" | ProductCategory;
};

export type ProductSort =
  | "default"
  | "price_asc"
  | "price_desc"
  | "popularity";
