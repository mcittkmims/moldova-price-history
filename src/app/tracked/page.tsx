"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TrackedProductsPage } from "../../components/pages/TrackedProductsPage";
import { useAuth } from "../../context/AuthContext";

export default function TrackedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login?next=%2Ftracked");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return <TrackedProductsPage />;
}
