"use client";

import type { PropsWithChildren } from "react";
import { AppStateProvider } from "../context/AppStateContext";
import { AuthProvider } from "../context/AuthContext";

export function Providers({ children }: PropsWithChildren) {
  return (
    <AuthProvider>
      <AppStateProvider>{children}</AppStateProvider>
    </AuthProvider>
  );
}
