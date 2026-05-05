import type { Product } from "../../types/product";

type AvailabilityBadgeProps = {
  availability: Product["availability"];
};

export function AvailabilityBadge({ availability }: AvailabilityBadgeProps) {
  const className = {
    "In stock":
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300",
    "Low stock":
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-300",
    Preorder:
      "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/70 dark:bg-sky-950/40 dark:text-sky-300",
    "Out of stock":
      "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300",
    Unknown:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-neutral-700 dark:bg-neutral-900/60 dark:text-neutral-300",
  }[availability];

  return (
    <span
      className={[
        "inline-flex h-7 items-center rounded-md border px-2.5 text-xs font-semibold",
        className,
      ].join(" ")}
    >
      {availability}
    </span>
  );
}
