import {
  PUBLIC_API_BASE_URL,
  PUBLIC_IMAGE_PROXY_BASE_URL,
} from "../lib/client-env";
import {
  categories,
  sortOptions,
  stores,
} from "../lib/catalog";
import {
  normalizeProduct,
} from "../lib/product-helpers";
import type {
  Product,
  ProductCategoryOption,
  ProductFilters,
  ProductHistory,
  ProductSort,
  SortOption,
  StoreOption,
} from "../types/product";

const liveProductsByKey = new Map<string, Product>();
const inFlightRequests = new Map<string, Promise<unknown>>();
const SUPPORTED_PRODUCT_HOSTS = new Set([
  "bomba.md",
  "www.bomba.md",
  "smart.md",
  "www.smart.md",
  "enter.online",
  "www.enter.online",
  "darwin.md",
  "www.darwin.md",
  "maximum.md",
  "www.maximum.md",
  "ultra.md",
  "www.ultra.md",
]);

export type SearchInputMode =
  | "empty"
  | "keyword"
  | "supported_url"
  | "unsupported_url";

const rememberLiveProduct = (product: Product) => {
  liveProductsByKey.set(product.id, product);
  if (product.slug) {
    liveProductsByKey.set(product.slug, product);
  }
};

const buildRequestUrl = (path: string, params?: URLSearchParams) => {
  const query = params ? `?${params.toString()}` : "";
  return `${PUBLIC_API_BASE_URL}${path}${query}`;
};

const buildRequestCacheKey = (path: string, params?: URLSearchParams) => {
  if (!params) {
    return path;
  }

  const normalizedParams = new URLSearchParams(
    Array.from(params.entries()).sort(([leftKey, leftValue], [rightKey, rightValue]) => {
      if (leftKey === rightKey) {
        return leftValue.localeCompare(rightValue);
      }
      return leftKey.localeCompare(rightKey);
    }),
  );

  return `${path}?${normalizedParams.toString()}`;
};

const fetchJson = async <T>(
  path: string,
  params?: URLSearchParams,
  options?: { dedupe?: boolean },
) => {
  if (options?.dedupe) {
    const cacheKey = buildRequestCacheKey(path, params);
    const inFlight = inFlightRequests.get(cacheKey) as Promise<T> | undefined;
    if (inFlight) {
      return inFlight;
    }

    const requestPromise = (async () => {
      const response = await fetch(buildRequestUrl(path, params));

      if (!response.ok) {
        throw await responseError(response);
      }

      return response.json() as Promise<T>;
    })();

    inFlightRequests.set(cacheKey, requestPromise as Promise<unknown>);

    try {
      return await requestPromise;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  }

  const response = await fetch(buildRequestUrl(path, params));

  if (!response.ok) {
    throw await responseError(response);
  }

  return response.json() as Promise<T>;
};

const responseError = async (response: Response) => {
  try {
    const payload = (await response.json()) as { detail?: string; message?: string };
    const detail = payload.detail ?? payload.message;
    if (detail) {
      return new Error(detail);
    }
  } catch {
    // Ignore non-JSON errors and fall back to status.
  }
  return new Error(`API request failed: ${response.status}`);
};

export const classifySearchInput = (value: string): SearchInputMode => {
  const query = value.trim();
  if (!query) {
    return "empty";
  }
  try {
    const url = new URL(query);
    if (!/^https?:$/i.test(url.protocol)) {
      return "unsupported_url";
    }
    return SUPPORTED_PRODUCT_HOSTS.has(url.host.toLowerCase())
      ? "supported_url"
      : "unsupported_url";
  } catch {
    return "keyword";
  }
};

const tryFetchProductBySlug = async (productSlug: string) => {
  const detailResponse = await fetch(
    `${PUBLIC_API_BASE_URL}/api/products/${encodeURIComponent(productSlug)}`,
  );

  if (detailResponse.ok) {
    const product = (await detailResponse.json()) as Product;
    return normalizeProduct(product, PUBLIC_IMAGE_PROXY_BASE_URL);
  }
  return null;
};

const PER_STORE_PAGE_SIZE = 4;

export const productService = {
  /** Fetch a single store's products for one page. Used by the progressive parallel loader. */
  async searchProductsForStore(
    filters: ProductFilters,
    sort: ProductSort,
    page: number,
    storeId: string,
  ) {
    const query = filters.query.trim();
    if (!query) return [];

    const params = new URLSearchParams({
      q: query,
      page: String(page),
      page_size: String(PER_STORE_PAGE_SIZE),
      store: storeId,
    });
    if (sort !== "default") params.set("sort", sort);
    if (filters.category !== "All") params.set("category", filters.category);

    try {
      const products = await fetchJson<Product[]>("/api/products/search", params, { dedupe: true });
      const normalized = products.map((product) =>
        normalizeProduct(product, PUBLIC_IMAGE_PROXY_BASE_URL),
      );
      normalized.forEach(rememberLiveProduct);
      return normalized;
    } catch (error) {
      console.error(`[${storeId}] search failed`, error);
      throw error;
    }
  },

  async productHistory(slug: string) {
    return fetchJson<ProductHistory>(`/api/products/${encodeURIComponent(slug)}/history`);
  },

  async resolveProductUrl(url: string) {
    const params = new URLSearchParams({ url: url.trim() });
    const product = await fetchJson<Product>("/api/products/lookup", params, { dedupe: true });
    const normalizedProduct = normalizeProduct(product, PUBLIC_IMAGE_PROXY_BASE_URL);
    rememberLiveProduct(normalizedProduct);
    return normalizedProduct;
  },

  async getProduct(productKey: string) {
    const liveProduct = liveProductsByKey.get(productKey);
    if (liveProduct) {
      return liveProduct;
    }

    try {
      const fetchedProduct = await tryFetchProductBySlug(productKey);
      if (fetchedProduct) {
        rememberLiveProduct(fetchedProduct);
        return fetchedProduct;
      }
    } catch (error) {
      console.error(error);
    }

    return null;
  },

  async getProductsBySlugs(productSlugs: string[]) {
    const products = await Promise.all(
      productSlugs.map((productSlug) => productService.getProduct(productSlug)),
    );
    return products.filter((product): product is Product => product != null);
  },

  async getStores() {
    return stores;
  },

  async getCategories() {
    return categories;
  },

  async getSortOptions() {
    return sortOptions;
  },
};

export { categories, sortOptions, stores };
