function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-ink-200/70 dark:bg-neutral-800 ${className}`} />;
}

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-3">
          <SkeletonBlock className="h-8 w-56" />
          <SkeletonBlock className="h-4 w-80 max-w-[80vw]" />
        </div>
        <SkeletonBlock className="h-10 w-32" />
      </div>

      <SkeletonBlock className="h-32 w-full" />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <SkeletonBlock className="h-[420px] w-full" />
        <SkeletonBlock className="h-[420px] w-full" />
      </div>
    </div>
  );
}
