import type { PricePoint, Product } from "../types/product";

export const formatMdl = (value: number) =>
  new Intl.NumberFormat("ro-MD", {
    style: "currency",
    currency: "MDL",
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));

export const getPriceDrop = (product: Product) =>
  product.previousPrice - product.currentPrice;

export const getPriceDropPercent = (product: Product) => {
  if (product.previousPrice === 0) {
    return 0;
  }

  return Math.round((getPriceDrop(product) / product.previousPrice) * 100);
};

export const getLowestPrice = (history: PricePoint[]) =>
  Math.min(...history.map((point) => point.price));

export const getHighestPrice = (history: PricePoint[]) =>
  Math.max(...history.map((point) => point.price));

export const getTrackedStats = (products: Product[]) => {
  const prices = products.map((product) => product.currentPrice);
  const drops = products.map((product) => getPriceDrop(product));
  const biggestDrop = products.reduce<Product | null>((best, product) => {
    if (!best || getPriceDrop(product) > getPriceDrop(best)) {
      return product;
    }

    return best;
  }, null);

  return {
    total: products.length,
    lowestPrice: prices.length ? Math.min(...prices) : 0,
    highestPrice: prices.length ? Math.max(...prices) : 0,
    averageDrop: drops.length
      ? Math.round(drops.reduce((sum, drop) => sum + drop, 0) / drops.length)
      : 0,
    biggestDrop,
  };
};
