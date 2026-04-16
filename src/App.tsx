import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";

function PlaceholderPage() {
  return <div className="text-sm text-ink-700 dark:text-neutral-300" />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<PlaceholderPage />} />
        <Route path="/search" element={<PlaceholderPage />} />
        <Route path="/products/:productId" element={<PlaceholderPage />} />
        <Route path="/tracked" element={<PlaceholderPage />} />
      </Route>
    </Routes>
  );
}
