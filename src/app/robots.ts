import type { MetadataRoute } from "next";
import { APP_BASE_URL } from "../lib/server-env";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = new URL(APP_BASE_URL);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: new URL("/sitemap.xml", baseUrl).toString(),
  };
}
