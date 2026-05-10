import {
  absoluteUrl,
  buildUrlSetXml,
  fetchProductSitemapPage,
  xmlResponse,
} from "../../../../lib/sitemap";

export const revalidate = 3600;

type ProductSitemapRouteProps = {
  params: Promise<{
    page: string;
  }>;
};

export async function GET(_request: Request, { params }: ProductSitemapRouteProps) {
  const resolvedParams = await params;
  const page = Number.parseInt(resolvedParams.page, 10);

  if (!Number.isFinite(page) || page < 1) {
    return new Response("Not found", { status: 404 });
  }

  const sitemapPage = await fetchProductSitemapPage(page);
  if (sitemapPage.totalPages > 0 && page > sitemapPage.totalPages) {
    return new Response("Not found", { status: 404 });
  }

  return xmlResponse(
    buildUrlSetXml(
      sitemapPage.items.map((product) => ({
        loc: absoluteUrl(`/products/${encodeURIComponent(product.slug)}`),
        lastModified: product.lastModified,
      })),
    ),
  );
}
