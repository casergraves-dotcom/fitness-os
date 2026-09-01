// ============================================================
// Imports
// ============================================================

import Link from "next/link";
import Image from "next/image";

// ============================================================
// Header
// ============================================================

export default function Header() {
  // ----------------------------------------------------------
  // Greeting
  // ----------------------------------------------------------

  const hour =
    new Date().getHours();

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
    <header
      className="
        border-b
        border-slate-200
        bg-white
        pt-[env(safe-area-inset-top)]
      "
    >
      <div
        className="
          mx-auto
          flex
          max-w-5xl
          items-center
          justify-between
          pl-[max(1rem,env(safe-area-inset-left))]
          pr-[max(1rem,env(safe-area-inset-right))]
          py-4
        "
      >
        {/* ------------------------------------------------
            App Title / Greeting
        ------------------------------------------------- */}

        <div className="flex min-w-0 items-center gap-3">
          <Image
            src="/icons/crg-app-icon-master.svg"
            alt="CRG"
            width={42}
            height={42}
            priority
            className="h-10 w-10 shrink-0 rounded-xl shadow-sm"
          />

          <div className="min-w-0">
            <p className="flex items-baseline gap-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
              <span>Fitness OS</span>
              <span className="text-[0.65rem] font-medium tracking-[0.16em] text-slate-500">
                by CRG
              </span>
            </p>

            <h1 className="mt-0.5 truncate text-xl font-bold text-slate-900 sm:text-2xl">
              {greeting}, Cody
            </h1>
          </div>
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
