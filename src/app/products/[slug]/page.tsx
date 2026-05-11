import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailsClient } from "../../../components/pages/ProductDetailsClient";
import { getServerProduct } from "../../../lib/server-products";
import { APP_BASE_URL } from "../../../lib/server-env";

export const revalidate = 300;

type ProductRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

const AVAILABILITY_SCHEMA: Record<string, string> = {
  "In stock": "https://schema.org/InStock",
  "Low stock": "https://schema.org/LimitedAvailability",
  "Preorder": "https://schema.org/PreOrder",
  "Out of stock": "https://schema.org/OutOfStock",
};

export async function generateMetadata({
  params,
}: ProductRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getServerProduct(decodeURIComponent(slug));

  if (!product) {
    return {
      title: "Product not found",
    };
  }

  const description = `${product.store} ${product.title} — price history and availability in Moldova. Track price changes and compare deals.`;

  return {
    title: `${product.title} — ${product.store} price history`,
    description,
    alternates: {
      canonical: `/products/${encodeURIComponent(product.slug)}`,
    },
    openGraph: {
      title: `${product.title} — ${product.store}`,
      description,
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
    },
  };
}

export default async function ProductRoute({ params }: ProductRouteProps) {
  const { slug } = await params;
  const product = await getServerProduct(decodeURIComponent(slug));

  if (!product) {
    notFound();
  }

  const pageUrl = `${APP_BASE_URL}/products/${encodeURIComponent(product.slug)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.imageUrl ?? undefined,
    description: `${product.store} ${product.title} — price history and availability in Moldova.`,
    brand: product.brand ? {
      "@type": "Brand",
      name: product.brand,
    } : undefined,
    sameAs: product.url,
    offers: {
      "@type": "Offer",
      url: pageUrl,
      priceCurrency: product.currency,
      price: product.currentPrice ?? undefined,
      priceValidUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      availability: AVAILABILITY_SCHEMA[product.availability] ?? "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: product.store,
        url: product.url,
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailsClient product={product} />
    </>
  );
}
