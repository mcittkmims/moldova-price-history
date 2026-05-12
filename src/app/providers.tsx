"use client";

import type { PropsWithChildren } from "react";
import { AppStateProvider } from "../context/AppStateContext";
import { AuthProvider } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";

export function Providers({ children }: PropsWithChildren) {
  return (
    <AuthProvider>
      <AppStateProvider>
        <LanguageProvider>{children}</LanguageProvider>
      </AppStateProvider>
    </AuthProvider>
  );
}
