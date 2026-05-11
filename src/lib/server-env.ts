const trimTrailingSlash = (value?: string | null) =>
  value?.replace(/\/$/, "");

export const SERVER_API_BASE_URL =
  trimTrailingSlash(process.env.PRICE_HISTORY_API_URL) ??
  trimTrailingSlash(process.env.NEXT_PUBLIC_PRICE_HISTORY_API_URL) ??
  "http://localhost:8080";

export const SCRAPER_API_BASE_URL = trimTrailingSlash(
  process.env.SCRAPER_API_URL,
);

export const SERVER_IMAGE_PROXY_BASE_URL =
  trimTrailingSlash(process.env.NEXT_PUBLIC_IMAGE_PROXY_URL) ?? "";

export const APP_BASE_URL =
  trimTrailingSlash(process.env.NEXT_PUBLIC_APP_URL) ??
  "http://localhost:3000";
