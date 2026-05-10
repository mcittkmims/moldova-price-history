import type { Product } from "../../types/product";

type AvailabilityBadgeProps = {
  availability: Product["availability"];
};

export function AvailabilityBadge({ availability }: AvailabilityBadgeProps) {
  const className = {
    "In stock":
      "border-moss-100 bg-white text-moss-700 dark:border-moss-900/60 dark:bg-[#171717] dark:text-moss-500",
    "Low stock":
      "border-rust-100 bg-white text-rust-700 dark:border-rust-700/40 dark:bg-[#171717] dark:text-rust-500",
    Preorder:
      "border-ink-200 bg-white text-ink-700 dark:border-neutral-700 dark:bg-[#1a1a1a] dark:text-neutral-200",
    "Out of stock":
      "border-ink-300 bg-white text-ink-700 dark:border-neutral-700 dark:bg-[#171717] dark:text-neutral-200",
    Unknown:
      "border-ink-200 bg-ink-50 text-ink-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300",
  }[availability];

  return (
    <span
      className={[
        "inline-flex h-7 items-center rounded-md border px-2.5 text-xs font-medium",
        className,
      ].join(" ")}
    >
      {availability}
    </span>
  );
}
