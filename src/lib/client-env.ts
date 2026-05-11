const trimTrailingSlash = (value?: string | null) =>
  value?.replace(/\/$/, "");

export const PUBLIC_API_BASE_URL =
  trimTrailingSlash(process.env.NEXT_PUBLIC_PRICE_HISTORY_API_URL) ??
  "http://localhost:8080";

export const PUBLIC_SCRAPER_API_BASE_URL = trimTrailingSlash(
  process.env.NEXT_PUBLIC_SCRAPER_API_URL,
);

export const PUBLIC_IMAGE_PROXY_BASE_URL =
  trimTrailingSlash(process.env.NEXT_PUBLIC_IMAGE_PROXY_URL) ?? "";
