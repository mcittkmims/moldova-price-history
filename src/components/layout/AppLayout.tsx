import { Outlet } from "react-router-dom";
import { Footer } from "./Footer";
import { Topbar } from "./Topbar";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-ink-100 text-ink-900 dark:bg-[#0f0f0f] dark:text-neutral-100">
      <div className="flex min-h-screen min-w-0 flex-col">
        <Topbar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-6 md:px-7">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
