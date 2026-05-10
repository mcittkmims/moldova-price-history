import type {
  ProductCategoryOption,
  SortOption,
  StoreOption,
} from "../types/product";

export const stores = [
  {
    id: "darwin",
    name: "Darwin",
    logoPath: "/store-logos/darwin.png",
    faviconPath: "/store-favicons/darwin.png",
  },
  {
    id: "enter",
    name: "Enter",
    logoPath: "/store-logos/enter.png",
    faviconPath: "/store-favicons/enter.png",
  },
  {
    id: "maximum",
    name: "Maximum",
    logoPath: "/store-logos/maximum.png",
    faviconPath: "/store-favicons/maximum.png",
  },
  {
    id: "smart",
    name: "Smart.md",
    logoPath: "/store-logos/smart.png",
    faviconPath: "/store-favicons/smart.png",
  },
  {
    id: "bomba",
    name: "Bomba",
    logoPath: "/store-logos/bomba.png",
    faviconPath: "/store-favicons/bomba.png",
  },
  {
    id: "ultra",
    name: "Ultra",
    logoPath: "/store-logos/ultra.png",
    faviconPath: "/store-favicons/ultra.png",
  },
] as StoreOption[];

export const categories = [
  { id: "phones", name: "Phones" },
  { id: "laptops", name: "Laptops" },
  { id: "tablets", name: "Tablets" },
  { id: "tvs", name: "TVs" },
  { id: "headphones", name: "Headphones" },
  { id: "smartwatches", name: "Smartwatches" },
  { id: "refrigerators", name: "Refrigerators" },
  { id: "washing_machines", name: "Washing machines" },
  { id: "dishwashers", name: "Dishwashers" },
  { id: "vacuums", name: "Vacuums" },
] as ProductCategoryOption[];

export const sortOptions = [
  { id: "default", name: "Store default" },
  { id: "price_asc", name: "Price ascending" },
  { id: "price_desc", name: "Price descending" },
  { id: "popularity", name: "Popularity" },
] as SortOption[];

export const storeIdFromName = (storeName: string) =>
  stores.find((store) => store.name === storeName)?.id ??
  storeName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
