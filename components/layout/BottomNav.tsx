"use client";

// ============================================================
// Imports
// ============================================================

import Link from "next/link";

import {
  usePathname,
} from "next/navigation";

import {
  navigation,
} from "@/lib/constants/navigation";

// ============================================================
// Bottom Navigation
// ============================================================

export default function BottomNav() {
  const pathname =
    usePathname();

  return (
    <nav
      className="
        fixed
        inset-x-0
        bottom-0
        z-50
        border-t
        border-slate-200
        bg-white
        pl-[env(safe-area-inset-left)]
        pr-[env(safe-area-inset-right)]
        pb-[env(safe-area-inset-bottom)]
      "
    >
      <div
        className="
          mx-auto
          grid
          max-w-5xl
          grid-cols-5
          px-2
          py-3
        "
      >
        {navigation.map(
          (item) => {
            const active =
              pathname ===
              item.href;

            const Icon =
              item.icon;

            return (
              <Link
                key={
                  item.href
                }
                href={
                  item.href
                }
                className={`
                  flex
                  flex-col
                  items-center
                  justify-center
                  gap-1
                  text-xs
                  transition
                  ${
                    active
                      ? "font-semibold text-blue-600"
                      : "text-slate-500 hover:text-slate-900"
                  }
                `}
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={active ? 2.5 : 2}
                  aria-hidden="true"
                />

                <span>
                  {
                    item.label
                  }
                </span>
              </Link>
            );
          }
        )}
      </div>
    </nav>
  );
}
