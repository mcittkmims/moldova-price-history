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

export type Product = {
  id: string;
  title: string;
  storeId?: StoreId;
  store: StoreName;
  category: ProductCategory;
  currentPrice: number;
  previousPrice: number;
  currency: "MDL";
  rating: number;
  availability: "In stock" | "Low stock" | "Preorder" | "Out of stock";
  url: string;
  imageTone: string;
  imageUrl?: string | null;
  specs: string[];
  history: PricePoint[];
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
