import Link from "next/link";
import { BarChart3, History, Upload } from "lucide-react";

type AppNavLinksProps = {
  /** Highlight the current section (optional). */
  active?: "upload" | "dashboard" | "history";
};

const linkClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 sm:px-4 sm:py-2.5";

const activeClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-800 shadow-sm sm:px-4 sm:py-2.5";

export function AppNavLinks({ active }: AppNavLinksProps) {
  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-2 sm:justify-end"
      aria-label="Main navigation"
    >
      <Link
        href="/"
        className={active === "upload" ? activeClass : linkClass}
      >
        <Upload className="size-4 shrink-0 text-indigo-600" aria-hidden />
        <span className="hidden sm:inline">Upload</span>
      </Link>
      <Link
        href="/dashboard"
        className={active === "dashboard" ? activeClass : linkClass}
      >
        <BarChart3 className="size-4 shrink-0 text-indigo-600" aria-hidden />
        <span className="hidden sm:inline">Dashboard</span>
      </Link>
      <Link
        href="/history"
        className={active === "history" ? activeClass : linkClass}
      >
        <History className="size-4 shrink-0 text-indigo-600" aria-hidden />
        <span className="hidden sm:inline">History</span>
      </Link>
    </nav>
  );
}
