import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const trimTrailingSlash = (value?: string | null) => value?.replace(/\/$/, "");

const uniqueValues = (values: Array<string | undefined>) =>
  Array.from(new Set(values.filter((value): value is string => Boolean(value))));

const appUrl =
  trimTrailingSlash(process.env.NEXT_PUBLIC_APP_URL) ?? "http://localhost:3000";
const apiUrl =
  trimTrailingSlash(process.env.NEXT_PUBLIC_PRICE_HISTORY_API_URL) ??
  "http://localhost:8080";
const imageProxyUrl = trimTrailingSlash(process.env.NEXT_PUBLIC_IMAGE_PROXY_URL);

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src ${uniqueValues(["'self'", "data:", "blob:", imageProxyUrl, apiUrl]).join(" ")}`,
  "font-src 'self' data:",
  `connect-src ${uniqueValues(["'self'", appUrl, apiUrl]).join(" ")}`,
  "frame-src 'none'",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-site",
  },
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains; preload",
        },
      ]),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir: isDev ? ".next-dev" : ".next",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
