import type { PricePoint, Product } from "../types/product";

export const formatMdl = (value: number | null | undefined, fallback = "No price") => {
  if (value == null) {
    return fallback;
  }

  return new Intl.NumberFormat("ro-MD", {
    style: "currency",
    currency: "MDL",
    maximumFractionDigits: 0,
  }).format(value);
};

export const hasPrice = (value: number | null | undefined): value is number =>
  value != null && value > 0;

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));

export const getPriceDrop = (product: Product) => {
  if (!hasPrice(product.currentPrice) || !hasPrice(product.previousPrice)) {
    return null;
  }

  return product.previousPrice - product.currentPrice;
};

export const getPriceDropPercent = (product: Product) => {
  const drop = getPriceDrop(product);
  if (drop == null || !hasPrice(product.previousPrice)) {
    return 0;
  }

  return Math.round((drop / product.previousPrice) * 100);
};

export const getLowestPrice = (history: PricePoint[]) =>
  history.length ? Math.min(...history.map((point) => point.price)) : null;

export const getHighestPrice = (history: PricePoint[]) =>
  history.length ? Math.max(...history.map((point) => point.price)) : null;

export const getTrackedStats = (products: Product[]) => {
  const prices = products
    .map((product) => product.currentPrice)
    .filter(hasPrice);
  const drops = products
    .map((product) => getPriceDrop(product))
    .filter((drop): drop is number => drop != null);
  const biggestDrop = products.reduce<Product | null>((best, product) => {
    const currentDrop = getPriceDrop(product);
    const bestDrop = best ? getPriceDrop(best) : null;
    if (currentDrop == null) {
      return best;
    }
    if (!best || bestDrop == null || currentDrop > bestDrop) {
      return product;
    }

    return best;
  }, null);

  return {
    total: products.length,
    lowestPrice: prices.length ? Math.min(...prices) : null,
    highestPrice: prices.length ? Math.max(...prices) : null,
    averageDrop: drops.length
      ? Math.round(drops.reduce((sum, drop) => sum + drop, 0) / drops.length)
      : null,
    biggestDrop,
  };
};
