"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { toErrorMessage } from "../../services/apiClient";
import { ProductCard } from "../products/ProductCard";
import { trackedProductService } from "../../services/trackedProductService";
import type { Product } from "../../types/product";

export function TrackedProductsPage() {
  const PAGE_SIZE = 12;
  const { hasPermission, isAuthenticated, isLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const canReadTracking = hasPermission("tracked:read_own");
  const canDeleteTracking = hasPermission("tracked:delete_own");

  useEffect(() => {
    let cancelled = false;

    const loadTrackedProducts = async () => {
      if (!isAuthenticated || !canReadTracking) {
        if (!cancelled) {
          setProducts([]);
          setLoadingProducts(false);
        }
        return;
      }

      setLoadingProducts(true);
      setErrorMessage(null);

      try {
        const trackedProducts = await trackedProductService.list(page, PAGE_SIZE);
        if (!cancelled) {
          setProducts(trackedProducts.items);
          setTotalPages(trackedProducts.totalPages);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(toErrorMessage(error, "Could not load tracked products."));
        }
      } finally {
        if (!cancelled) {
          setLoadingProducts(false);
        }
      }
    };

    void loadTrackedProducts();

    return () => {
      cancelled = true;
    };
  }, [PAGE_SIZE, canReadTracking, isAuthenticated, page]);

  const handleUntrack = async (slug: string) => {
    try {
      await trackedProductService.untrack(slug);
      if (products.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1);
        return;
      }

      const trackedProducts = await trackedProductService.list(page, PAGE_SIZE);
      setProducts(trackedProducts.items);
      setTotalPages(trackedProducts.totalPages);
    } catch (error) {
      setErrorMessage(toErrorMessage(error, "Could not remove that product."));
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">
          Tracking
        </h1>
      </div>

      {errorMessage ? (
        <div className="rounded-md border border-rust-100 bg-rust-50 px-3 py-2 text-sm text-rust-700 dark:border-rust-700 dark:bg-[#2b170d] dark:text-rust-100">
          {errorMessage}
        </div>
      ) : null}

      {isLoading || loadingProducts ? (
        <div className="grid min-h-[220px] place-items-center rounded-lg border border-ink-200 bg-white p-8 dark:border-neutral-800 dark:bg-[#171717]">
          <LoaderCircle className="h-6 w-6 animate-spin text-moss-700 dark:text-moss-500" />
        </div>
      ) : !isAuthenticated ? null : !canReadTracking ? (
        <div className="rounded-lg border border-ink-200 bg-white px-4 py-6 text-sm text-ink-600 dark:border-neutral-800 dark:bg-[#171717] dark:text-neutral-300">
          This account cannot view tracked products.
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-lg border border-ink-200 bg-white px-4 py-6 text-sm text-ink-600 dark:border-neutral-800 dark:bg-[#171717] dark:text-neutral-300">
          No products tracked at the moment.
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.slug} className="space-y-3">
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  disabled={!canDeleteTracking}
                  onClick={() => {
                    void handleUntrack(product.slug);
                  }}
                  className="inline-flex h-9 items-center rounded-md border border-ink-200 bg-white px-3 text-sm text-ink-800 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:bg-[#171717] dark:text-neutral-100 dark:hover:bg-neutral-800"
                >
                  Untrack
                </button>
              </div>
              <ProductCard product={product} />
            </div>
          ))}

          {totalPages > 1 ? (
            <div className="flex items-center justify-between border-t border-ink-200 pt-4 dark:border-neutral-800">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((currentPage) => currentPage - 1)}
                className="inline-flex h-9 items-center rounded-md border border-ink-200 bg-white px-3 text-sm text-ink-800 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:bg-[#171717] dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                Previous
              </button>
              <div className="text-sm text-ink-500 dark:text-neutral-400">
                Page {page} of {totalPages}
              </div>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((currentPage) => currentPage + 1)}
                className="inline-flex h-9 items-center rounded-md border border-ink-200 bg-white px-3 text-sm text-ink-800 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-700 dark:bg-[#171717] dark:text-neutral-100 dark:hover:bg-neutral-800"
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
