import { useState } from "react";
import type { Product } from "../../types/product";

function initials(store: string) {
  return store
    .split(/[\s.]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type StoreMarkProps = {
  product: Pick<Product, "store" | "storeId">;
};

export function StoreMark({ product }: StoreMarkProps) {
  const [failed, setFailed] = useState(false);
  const iconUrl = product.storeId ? `/store-favicons/${product.storeId}.png` : null;

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <span className="grid h-5 w-5 shrink-0 place-items-center overflow-hidden rounded border border-ink-200 bg-white text-[10px] font-semibold text-ink-600 dark:border-neutral-700">
        {iconUrl && !failed ? (
          <img
            src={iconUrl}
            alt=""
            loading="lazy"
            className="h-4 w-4 object-contain"
            onError={() => setFailed(true)}
          />
        ) : (
          initials(product.store)
        )}
      </span>
      <span className="truncate">{product.store}</span>
    </span>
  );
}
