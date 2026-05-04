import { mockProducts } from "../data/mockProducts";
import type {
  Product,
  ProductCategoryOption,
  ProductFilters,
  ProductSort,
  SortOption,
  StoreOption,
  StoreName,
} from "../types/product";

const API_BASE_URL =
  import.meta.env.VITE_PRICE_HISTORY_API_URL?.replace(/\/$/, "") ??
  "http://localhost:8080";

const liveProductsById = new Map<string, Product>();

const delay = <T>(value: T) =>
  new Promise<T>((resolve) => {
    window.setTimeout(() => resolve(value), 180);
  });

const isLikelyUrl = (value: string) => /^https?:\/\//i.test(value.trim());

const proxiedImageUrl = (imageUrl?: string | null) => {
  if (!imageUrl || !isLikelyUrl(imageUrl)) {
    return imageUrl;
  }
  return `${API_BASE_URL}/images/proxy?url=${encodeURIComponent(imageUrl)}`;
};

const normalizeProduct = (product: Product): Product => ({
  ...product,
  storeId: product.storeId ?? storeIdFromName(product.store),
  imageUrl: proxiedImageUrl(product.imageUrl),
});

const storeIdFromName = (storeName: string) =>
  stores.find((store) => store.name === storeName)?.id ??
  storeName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

const productMatchesLink = (product: Product, query: string) => {
  const normalized = query.trim().toLowerCase();
  return (
    product.url.toLowerCase() === normalized ||
    product.url.toLowerCase().includes(normalized) ||
    normalized.includes(product.id.toLowerCase())
  );
};

const productMatchesText = (product: Product, query: string) => {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  return [
    product.title,
    product.store,
    product.category,
    product.specs.join(" "),
    product.url,
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalized);
};

const productMatchesCategory = (product: Product, categoryId: ProductFilters["category"]) => {
  if (categoryId === "All") {
    return true;
  }
  const category = categories.find((item) => item.id === categoryId);
  return product.category === categoryId || product.category === category?.name;
};

const applySort = (products: Product[], sort: ProductSort) => {
  const sorted = [...products];
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

  if (sort === "price_asc") {
    return sorted.sort((a, b) => comparePrice(a, b, true));
  }

  if (sort === "price_desc") {
    return sorted.sort((a, b) => comparePrice(a, b, false));
  }

  return sorted;
};

const fetchJson = async <T>(path: string, params?: URLSearchParams) => {
  const query = params ? `?${params.toString()}` : "";
  const response = await fetch(`${API_BASE_URL}${path}${query}`);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
};

const searchMockProducts = (filters: ProductFilters, sort: ProductSort) => {
  const query = filters.query.trim();
  const products = mockProducts.filter((product) => {
    const matchesQuery = isLikelyUrl(query)
      ? productMatchesLink(product, query)
      : productMatchesText(product, query);
    const productStoreId = product.storeId ?? storeIdFromName(product.store);
    const matchesStore =
      filters.store === "All" ||
      productStoreId === filters.store ||
      product.store === filters.store;
    const matchesCategory = productMatchesCategory(product, filters.category);

    return matchesQuery && matchesStore && matchesCategory;
  });

  return applySort(products, sort);
};

export const productService = {
  async searchProducts(filters: ProductFilters, sort: ProductSort) {
    const query = filters.query.trim();

    if (!query) {
      return [];
    }

    const params = new URLSearchParams({
      q: query,
      page: "1",
      page_size: "24",
    });
    if (sort !== "default") {
      params.set("sort", sort);
    }
    if (filters.store !== "All") {
      params.set("store", filters.store);
    }
    if (filters.category !== "All") {
      params.set("category", filters.category);
    }

    try {
      const products = await fetchJson<Product[]>("/products/search", params);
      const normalizedProducts = products.map(normalizeProduct);
      normalizedProducts.forEach((product) => liveProductsById.set(product.id, product));
      return normalizedProducts;
    } catch (error) {
      console.error(error);
      return searchMockProducts(filters, sort);
    }
  },

  async getProduct(productId: string) {
    const liveProduct = liveProductsById.get(productId);
    if (liveProduct) {
      return liveProduct;
    }

    return delay(
      mockProducts.find((product) => product.id === productId) ?? null,
    );
  },

  async getProductsByIds(productIds: string[]) {
    const idSet = new Set(productIds);
    return delay(mockProducts.filter((product) => idSet.has(product.id)));
  },

  async getStores() {
    return delay(stores);
  },

  async getCategories() {
    return delay(categories);
  },

  async getSortOptions() {
    return delay(sortOptions);
  },
};

export const stores = [
  { id: "darwin", name: "Darwin", logoPath: "/store-logos/darwin.png", faviconPath: "/store-favicons/darwin.png" },
  { id: "enter", name: "Enter", logoPath: "/store-logos/enter.png", faviconPath: "/store-favicons/enter.png" },
  { id: "maximum", name: "Maximum", logoPath: "/store-logos/maximum.png", faviconPath: "/store-favicons/maximum.png" },
  { id: "smart", name: "Smart.md", logoPath: "/store-logos/smart.png", faviconPath: "/store-favicons/smart.png" },
  { id: "bomba", name: "Bomba", logoPath: "/store-logos/bomba.png", faviconPath: "/store-favicons/bomba.png" },
  { id: "ultra", name: "Ultra", logoPath: "/store-logos/ultra.png", faviconPath: "/store-favicons/ultra.png" },
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
