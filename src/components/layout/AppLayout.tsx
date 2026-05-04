import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import { Topbar } from "./Topbar";

export function AppLayout() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-ink-100 text-ink-900 dark:bg-[#0f0f0f] dark:text-neutral-100">
      <div className="flex min-h-screen min-w-0 flex-col overflow-x-hidden">
        <Topbar />
        <main className="w-full flex-1 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
