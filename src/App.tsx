import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { HomePage } from "./pages/HomePage";
import { ProductDetailsPage } from "./pages/ProductDetailsPage";
import { SearchPage } from "./pages/SearchPage";
import { TrackedProductsPage } from "./pages/TrackedProductsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/products/:productId" element={<ProductDetailsPage />} />
        <Route path="/tracked" element={<TrackedProductsPage />} />
      </Route>
    </Routes>
  );
}
