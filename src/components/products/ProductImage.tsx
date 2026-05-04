import { useState } from "react";
import type { Product } from "../../types/product";

type ProductImageProps = {
  product: Product;
  className: string;
  placeholderClassName: string;
  imageClassName?: string;
};

export function ProductImage({
  product,
  className,
  placeholderClassName,
  imageClassName = "h-full w-full object-contain p-1",
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const showImage = product.imageUrl && !failed;

  return (
    <div
      className={className}
      aria-hidden="true"
    >
      {showImage ? (
        <img
          src={product.imageUrl ?? undefined}
          alt=""
          loading="lazy"
          className={imageClassName}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className={placeholderClassName} />
      )}
    </div>
  );
}
