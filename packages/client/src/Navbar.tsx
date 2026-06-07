import { Link } from "react-router-dom";
import { useAuth } from "./useAuth";

function HangarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M2 10 Q12 2 22 10 V20 H2 Z" />
      <path d="M7 20 V13 H17 V20" />
      <path d="M12 13 V20" />
    </svg>
  );
}

export function Navbar() {
  const { user } = useAuth();

  return (
    <nav
      aria-label="Primary"
      className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-900/70"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          to="/"
          className="group inline-flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50"
        >
          <HangarIcon className="h-12 w-12 text-blue-600 transition-transform duration-200 group-hover:-translate-y-px dark:text-blue-400" />
          <div className="leading-none pt-1.5">
            Hangar{" "}
            <span className="text-blue-600 dark:text-blue-400">1000</span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {user.firstName} {user.lastName}
              </span>
              <button
                type="button"
                className="rounded-md border border-slate-300 bg-white/80 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:text-slate-300 dark:hover:text-slate-50"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-400 dark:focus:ring-blue-900/50"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
