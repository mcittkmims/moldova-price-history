"use client";

import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { ProductSort, ThemeMode } from "../types/product";

type AppState = {
  theme: ThemeMode;
  defaultSort: ProductSort;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setDefaultSort: (sort: ProductSort) => void;
};

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useLocalStorage<ThemeMode>(
    "mph-theme",
    "light",
  );
  const [defaultSort, setDefaultSort] = useLocalStorage<ProductSort>(
    "mph-default-sort",
    "default",
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const value = useMemo<AppState>(() => {
    return {
      theme,
      defaultSort,
      setTheme,
      setDefaultSort,
      toggleTheme: () => setTheme(theme === "light" ? "dark" : "light"),
    };
  }, [defaultSort, setDefaultSort, setTheme, theme]);

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used inside AppStateProvider");
  }

  return context;
}
