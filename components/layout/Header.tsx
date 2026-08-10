// ============================================================
// Imports
// ============================================================

import Link from "next/link";

// ============================================================
// Header
// ============================================================

export default function Header() {
  // ----------------------------------------------------------
  // Greeting
  // ----------------------------------------------------------

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 17
        ? "Good Afternoon"
        : "Good Evening";

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        {/* ------------------------------------------------
            App Title / Greeting
        ------------------------------------------------- */}

        <div>
          <p className="text-sm font-semibold tracking-wider text-blue-600">
            FITNESS OS
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            {greeting}, Cody
          </h1>
        </div>

        {/* ------------------------------------------------
            Settings
        ------------------------------------------------- */}

        <Link
          href="/settings"
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm transition hover:bg-slate-100"
        >
          Settings
        </Link>
      </div>
    </header>
  );
}