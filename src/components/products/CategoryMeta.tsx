type CategoryMetaProps = {
  category: string;
  textClassName?: string;
};

export function CategoryMeta({
  category,
  textClassName = "text-ink-600 dark:text-neutral-300",
}: CategoryMetaProps) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <span
        aria-hidden="true"
        className="h-1 w-1 rounded-full bg-ink-300 dark:bg-neutral-600"
      />
      <span className={`truncate ${textClassName}`}>{category}</span>
    </span>
  );
}
