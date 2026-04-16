import { mockProducts } from "../data/mockProducts";
import type {
  Product,
  ProductCategory,
  ProductFilters,
  ProductSort,
  StoreName,
} from "../types/product";
import { getPriceDrop } from "../utils/pricing";

const delay = <T>(value: T) =>
  new Promise<T>((resolve) => {
    window.setTimeout(() => resolve(value), 180);
  });

const isLikelyUrl = (value: string) => /^https?:\/\//i.test(value.trim());

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

const applySort = (products: Product[], sort: ProductSort) => {
  const sorted = [...products];

  if (sort === "price-low") {
    return sorted.sort((a, b) => a.currentPrice - b.currentPrice);
  }

  if (sort === "price-high") {
    return sorted.sort((a, b) => b.currentPrice - a.currentPrice);
  }

  if (sort === "drop") {
    return sorted.sort((a, b) => getPriceDrop(b) - getPriceDrop(a));
  }

  return sorted;
};

export const productService = {
  async searchProducts(filters: ProductFilters, sort: ProductSort) {
    const query = filters.query.trim();
    const products = mockProducts.filter((product) => {
      const matchesQuery = isLikelyUrl(query)
        ? productMatchesLink(product, query)
        : productMatchesText(product, query);
      const matchesStore =
        filters.store === "All" || product.store === filters.store;
      const matchesCategory =
        filters.category === "All" || product.category === filters.category;

      return matchesQuery && matchesStore && matchesCategory;
    });

    return delay(applySort(products, sort));
  },

  async getProduct(productId: string) {
    return delay(
      mockProducts.find((product) => product.id === productId) ?? null,
    );
  },

  async getProductsByIds(productIds: string[]) {
    const idSet = new Set(productIds);
    return delay(mockProducts.filter((product) => idSet.has(product.id)));
  },

  async getStores() {
    return delay(Array.from(new Set(mockProducts.map((item) => item.store))));
  },

  async getCategories() {
    return delay(
      Array.from(new Set(mockProducts.map((item) => item.category))),
    );
  },
};

export const stores = Array.from(
  new Set(mockProducts.map((product) => product.store)),
) as StoreName[];

export const categories = Array.from(
  new Set(mockProducts.map((product) => product.category)),
) as ProductCategory[];
