import {
  absoluteUrl,
  buildSitemapIndexXml,
  fetchProductSitemapSummary,
  xmlResponse,
} from "../../lib/sitemap";

export const revalidate = 3600;

export async function GET() {
  const entries = [absoluteUrl("/sitemaps/static")];

  try {
    const summary = await fetchProductSitemapSummary();
    for (let page = 1; page <= summary.totalPages; page += 1) {
      entries.push(absoluteUrl(`/sitemaps/products/${page}`));
    }
  } catch (error) {
    console.error(error);
  }

  return xmlResponse(buildSitemapIndexXml(entries));
}
