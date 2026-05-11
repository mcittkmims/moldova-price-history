import { cache } from "react";
import { normalizeProduct } from "./product-helpers";
import {
  SERVER_API_BASE_URL,
  SERVER_IMAGE_PROXY_BASE_URL,
} from "./server-env";
import type { Product } from "../types/product";

const fetchBackendProduct = async (productSlug: string) => {
  const response = await fetch(
    `${SERVER_API_BASE_URL}/api/products/${encodeURIComponent(productSlug)}`,
    {
      next: { revalidate: 300 },
    },
  );

  if (!response.ok) {
    return null;
  }

  const product = (await response.json()) as Product;
  return normalizeProduct(product, SERVER_IMAGE_PROXY_BASE_URL);
};

export const getServerProduct = cache(async (productSlug: string) => {
  try {
    const backendProduct = await fetchBackendProduct(productSlug);
    if (backendProduct) {
      return backendProduct;
    }
  } catch (error) {
    console.error(error);
  }
  return null;
});
