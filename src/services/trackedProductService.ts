import { PUBLIC_IMAGE_PROXY_BASE_URL } from "../lib/client-env";
import { normalizeProduct } from "../lib/product-helpers";
import type { Product } from "../types/product";
import { apiFetch, responseError } from "./apiClient";

type TrackedProductsPage = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: Product[];
};

type TrackedStatusPayload = {
  tracked: boolean;
};

type TrackedProductPayload = {
  product: Product;
  tracked: boolean;
};

const normalizeTrackedProductsPage = (
  payload: TrackedProductsPage | Product[],
  requestedPage: number,
  requestedPageSize: number,
): TrackedProductsPage => {
  if (Array.isArray(payload)) {
    return {
      page: requestedPage,
      pageSize: requestedPageSize,
      totalItems: payload.length,
      totalPages: payload.length > 0 ? 1 : 0,
      items: payload,
    };
  }

  return {
    page: payload.page ?? requestedPage,
    pageSize: payload.pageSize ?? requestedPageSize,
    totalItems: payload.totalItems ?? 0,
    totalPages: payload.totalPages ?? 0,
    items: Array.isArray(payload.items) ? payload.items : [],
  };
};

export const trackedProductService = {
  async list(page: number, pageSize: number) {
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
    });
    const response = await apiFetch(`/api/me/tracked?${params.toString()}`);

    if (!response.ok) {
      throw await responseError(response);
    }

    const rawPayload = (await response.json()) as TrackedProductsPage | Product[];
    const payload = normalizeTrackedProductsPage(rawPayload, page, pageSize);

    return {
      ...payload,
      items: payload.items.map((product) => normalizeProduct(product, PUBLIC_IMAGE_PROXY_BASE_URL)),
    };
  },

  async status(slug: string) {
    const response = await apiFetch(`/api/me/tracked/${encodeURIComponent(slug)}`);

    if (!response.ok) {
      throw await responseError(response);
    }

    const payload = (await response.json()) as TrackedStatusPayload;
    return payload.tracked;
  },

  async track(slug: string) {
    const response = await apiFetch(`/api/me/tracked/${encodeURIComponent(slug)}`, {
      method: "PUT",
    });

    if (!response.ok) {
      throw await responseError(response);
    }

    const payload = (await response.json()) as TrackedProductPayload;
    return { product: normalizeProduct(payload.product, PUBLIC_IMAGE_PROXY_BASE_URL), tracked: payload.tracked };
  },

  async untrack(slug: string) {
    const response = await apiFetch(`/api/me/tracked/${encodeURIComponent(slug)}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw await responseError(response);
    }

    const payload = (await response.json()) as TrackedProductPayload;
    return { product: normalizeProduct(payload.product, PUBLIC_IMAGE_PROXY_BASE_URL), tracked: payload.tracked };
  },
};
