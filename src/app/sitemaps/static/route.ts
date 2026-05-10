import {
  absoluteUrl,
  buildUrlSetXml,
  xmlResponse,
} from "../../../lib/sitemap";

export const revalidate = 3600;

export async function GET() {
  const now = new Date().toISOString();
  const routes = [
    "/",
    "/home",
    "/search",
    "/tracked",
  ];

  return xmlResponse(
    buildUrlSetXml(
      routes.map((route) => ({
        loc: absoluteUrl(route),
        lastModified: now,
      })),
    ),
  );
}
