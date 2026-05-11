import { APP_BASE_URL, SERVER_API_BASE_URL } from "./server-env";

export const SITEMAP_PAGE_SIZE = 5000;
export const SITEMAP_REVALIDATE_SECONDS = 3600;

type ProductSitemapSummary = {
  totalItems: number;
  pageSize: number;
  totalPages: number;
};

type ProductSitemapPage = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: Array<{
    slug: string;
    lastModified: string;
  }>;
};

const xmlEscape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const absoluteUrl = (path: string) =>
  new URL(path, APP_BASE_URL).toString();

export const xmlResponse = (body: string) =>
  new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": `public, s-maxage=${SITEMAP_REVALIDATE_SECONDS}, stale-while-revalidate=86400`,
    },
  });

export const buildSitemapIndexXml = (entries: string[]) => {
  const items = entries
    .map((url) => `<sitemap><loc>${xmlEscape(url)}</loc></sitemap>`)
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</sitemapindex>`;
};

export const buildUrlSetXml = (
  entries: Array<{
    loc: string;
    lastModified?: string;
  }>,
) => {
  const items = entries
    .map((entry) => {
      const lastModified = entry.lastModified
        ? `<lastmod>${xmlEscape(entry.lastModified)}</lastmod>`
        : "";
      return `<url><loc>${xmlEscape(entry.loc)}</loc>${lastModified}</url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${items}</urlset>`;
};

export async function fetchProductSitemapSummary(): Promise<ProductSitemapSummary> {
  const response = await fetch(
    `${SERVER_API_BASE_URL}/api/products/sitemap?page_size=${SITEMAP_PAGE_SIZE}`,
    {
      next: { revalidate: SITEMAP_REVALIDATE_SECONDS },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap summary: ${response.status}`);
  }

  return response.json() as Promise<ProductSitemapSummary>;
}

export async function fetchProductSitemapPage(page: number): Promise<ProductSitemapPage> {
  const response = await fetch(
    `${SERVER_API_BASE_URL}/api/products/sitemap/page?page=${page}&page_size=${SITEMAP_PAGE_SIZE}`,
    {
      next: { revalidate: SITEMAP_REVALIDATE_SECONDS },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap page ${page}: ${response.status}`);
  }

  return response.json() as Promise<ProductSitemapPage>;
}
