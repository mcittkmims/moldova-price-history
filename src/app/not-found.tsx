import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-[720px] rounded-lg border border-ink-200 bg-white p-8 shadow-soft dark:border-neutral-800 dark:bg-[#171717]">
      <h1 className="text-2xl font-semibold">Product not found</h1>
      <p className="mt-3 text-sm text-ink-500 dark:text-neutral-400">
        The product URL exists in the new frontend routing layer, but the backend
        did not return a matching product record for this request.
      </p>
      <Link
        href="/search"
        className="mt-6 inline-flex rounded-md border border-ink-300 px-3 py-2 text-sm hover:bg-ink-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
      >
        Back to search
      </Link>
    </div>
  );
}
