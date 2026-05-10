import { storeIdFromName } from "./catalog";
import type { Product } from "../types/product";

const isLikelyUrl = (value: string) => /^https?:\/\//i.test(value.trim());

const proxiedImageUrl = (imageProxyBaseUrl: string, imageUrl?: string | null) => {
  if (!imageUrl || !isLikelyUrl(imageUrl) || !imageProxyBaseUrl) {
    return imageUrl;
  }

  return `${imageProxyBaseUrl}/proxy?url=${encodeURIComponent(imageUrl)}`;
};

export const normalizeProduct = (
  product: Product,
  imageProxyBaseUrl = "",
): Product => ({
  ...product,
  storeId: product.storeId ?? storeIdFromName(product.store),
  imageUrl: proxiedImageUrl(imageProxyBaseUrl, product.imageUrl),
});
