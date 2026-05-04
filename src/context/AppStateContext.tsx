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
  trackedIds: string[];
  defaultSort: ProductSort;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setDefaultSort: (sort: ProductSort) => void;
  isTracked: (productId: string) => boolean;
  trackProduct: (productId: string) => void;
  untrackProduct: (productId: string) => void;
  toggleTracked: (productId: string) => void;
};

const AppStateContext = createContext<AppState | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useLocalStorage<ThemeMode>(
    "mph-theme",
    "light",
  );
  const [trackedIds, setTrackedIds] = useLocalStorage<string[]>(
    "mph-tracked-products",
    ["darwin-iphone-15-128", "ultra-airpods-pro-2"],
  );
  const [defaultSort, setDefaultSort] = useLocalStorage<ProductSort>(
    "mph-default-sort",
    "default",
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const value = useMemo<AppState>(() => {
    const isTracked = (productId: string) => trackedIds.includes(productId);

    const trackProduct = (productId: string) => {
      setTrackedIds((current) =>
        current.includes(productId) ? current : [...current, productId],
      );
    };

    const untrackProduct = (productId: string) => {
      setTrackedIds((current) => current.filter((id) => id !== productId));
    };

    return {
      theme,
      trackedIds,
      defaultSort,
      setTheme,
      setDefaultSort,
      toggleTheme: () => setTheme(theme === "light" ? "dark" : "light"),
      isTracked,
      trackProduct,
      untrackProduct,
      toggleTracked: (productId: string) => {
        if (isTracked(productId)) {
          untrackProduct(productId);
        } else {
          trackProduct(productId);
        }
      },
    };
  }, [defaultSort, setDefaultSort, setTheme, setTrackedIds, theme, trackedIds]);

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
