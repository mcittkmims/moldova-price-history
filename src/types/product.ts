export type ThemeMode = "light" | "dark";

export type ProductCategory =
  | "Phones"
  | "Laptops"
  | "Home"
  | "Audio"
  | "Appliances"
  | "Gaming";

export type StoreName =
  | "Darwin"
  | "Enter"
  | "Maximum"
  | "Xstore"
  | "Smart.md"
  | "Bomba";

export type PricePoint = {
  date: string;
  price: number;
};

export type Product = {
  id: string;
  title: string;
  store: StoreName;
  category: ProductCategory;
  currentPrice: number;
  previousPrice: number;
  currency: "MDL";
  rating: number;
  availability: "In stock" | "Low stock" | "Preorder";
  url: string;
  imageTone: string;
  specs: string[];
  history: PricePoint[];
  lastChecked: string;
};

export type ProductFilters = {
  query: string;
  store: "All" | StoreName;
  category: "All" | ProductCategory;
};

export type ProductSort = "relevance" | "price-low" | "price-high" | "drop";
