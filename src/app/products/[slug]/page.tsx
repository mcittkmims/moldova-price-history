import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailsClient } from "../../../components/pages/ProductDetailsClient";
import { getServerProduct } from "../../../lib/server-products";

export const revalidate = 300;

type ProductRouteProps = {
  params: Promise<{
    slug: string;
  }>;
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

  return {
    title: product.title,
    description: `${product.store} ${product.title} price history and latest availability.`,
    alternates: {
      canonical: `/products/${encodeURIComponent(product.slug)}`,
    },
    openGraph: {
      title: product.title,
      description: `${product.store} ${product.title} price history and latest availability.`,
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

  return <ProductDetailsClient product={product} />;
}
