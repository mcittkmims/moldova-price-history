import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { CategoryMeta } from "./CategoryMeta";
import { ProductImage } from "./ProductImage";
import { StoreMark } from "./StoreMark";
import type { Product } from "../../types/product";
import {
  formatDate,
  formatMdl,
  hasPrice,
  getPriceDrop,
  getPriceDropPercent,
} from "../../utils/pricing";

type ProductCardProps = {
  product: Product;
  compact?: boolean;
};

export function ProductCard({
  product,
  compact = false,
}: ProductCardProps) {
  const productPath = `/products/${encodeURIComponent(product.slug)}`;
  const drop = getPriceDrop(product);
  const isLower = drop != null && drop > 0;
  const hasCurrentPrice = hasPrice(product.currentPrice);
  const hasPreviousPrice = hasPrice(product.previousPrice);
  const noStorePrice = !hasCurrentPrice;
  const imageBackdrop = {
    background: "#ffffff",
  };

  return (
    <article className="w-full min-w-0 overflow-hidden rounded-lg border border-ink-200 bg-white shadow-soft dark:border-neutral-800 dark:bg-[#171717]">
      <div className="flex min-w-0 flex-col sm:flex-row">
        <Link
          href={productPath}
          className="block shrink-0 sm:w-[132px]"
          aria-label={`Open ${product.title}`}
        >
          <ProductImage
            product={product}
            className="grid aspect-[4/3] w-full place-items-center overflow-hidden border-b border-ink-200 dark:border-neutral-800 sm:h-full sm:min-h-[200px] sm:border-b-0 sm:border-r"
            imageClassName="h-full w-full object-contain p-5 sm:p-4"
            placeholderClassName="h-24 w-16 rounded-md border border-white/70 bg-white/80 sm:h-20 sm:w-14"
            style={imageBackdrop}
          />
        </Link>

        <div className="min-w-0 flex-1 overflow-hidden p-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <Link
              href={productPath}
              className="block min-h-[3rem] overflow-hidden break-words text-[15px] font-semibold leading-6 hover:text-moss-700 sm:min-h-[3.25rem] sm:text-base dark:hover:text-moss-500"
              style={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
              }}
            >
              {product.title}
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-500 dark:text-neutral-400">
              <StoreMark product={product} />
              <CategoryMeta
                category={product.category}
                textClassName="text-ink-500 dark:text-neutral-400"
              />
            </div>
          </div>

          <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            {noStorePrice ? (
              <div className="min-w-0">
                <div className="truncate text-xl font-semibold text-ink-700 dark:text-neutral-200 sm:text-xl">
                  No price listed
                </div>
                <div className="mt-1 truncate text-xs text-ink-500 sm:text-sm dark:text-neutral-400">
                  {product.availability === "Out of stock"
                    ? "Currently out of stock at the store."
                    : "The store page does not publish a price right now."}
                </div>
              </div>
            ) : (
              <>
                <div className="min-w-0">
                  <div className="truncate text-2xl font-semibold sm:text-xl">
                    {formatMdl(product.currentPrice)}
                  </div>
                  <div className="mt-1 truncate text-xs text-ink-500 sm:text-sm dark:text-neutral-400">
                    {hasPreviousPrice
                      ? `Previous ${formatMdl(product.previousPrice)}`
                      : "No previous price"}
                  </div>
                </div>

                <div className="min-w-0 rounded-2xl bg-ink-50 px-3 py-2 text-xs sm:bg-transparent sm:px-0 sm:py-0 sm:text-right sm:text-sm dark:bg-neutral-800/80 sm:dark:bg-transparent">
                  <div
                    className={
                      isLower
                        ? "font-medium text-moss-700 dark:text-moss-500"
                        : "font-medium text-rust-700 dark:text-rust-500"
                    }
                  >
                    {drop == null
                      ? "No price change"
                      : isLower
                        ? `${formatMdl(drop)} lower`
                        : `${formatMdl(Math.abs(drop))} higher`}
                  </div>
                  <div className="mt-1 text-ink-500 dark:text-neutral-400">
                    {drop == null ? "Waiting for a comparable price" : `${isLower ? getPriceDropPercent(product) : 0}% since last price`}
                  </div>
                </div>
              </>
            )}
          </div>

          {!compact ? (
            <div className="mt-4 flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-ink-200 pt-3 text-xs text-ink-500 sm:gap-3 sm:text-sm dark:border-neutral-800 dark:text-neutral-400">
              <div className="min-w-0">
                <AvailabilityBadge availability={product.availability} />
              </div>
              <div className="min-w-0 truncate text-right sm:text-left">
                Checked {formatDate(product.lastChecked)}
              </div>
              <a
                href={product.url}
                target="_blank"
                rel="noreferrer"
                className="col-span-2 inline-flex min-w-0 items-center gap-1 hover:text-moss-700 sm:col-span-1 dark:hover:text-moss-500"
              >
                <span className="min-w-0 truncate">Store page</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
