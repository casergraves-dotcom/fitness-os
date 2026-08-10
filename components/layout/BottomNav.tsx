"use client";

// ============================================================
// Imports
// ============================================================

import Link from "next/link";

import {
  usePathname,
} from "next/navigation";

// ============================================================
// Navigation
// ============================================================

const items = [
  {
    href: "/today",
    label: "Today",
    icon: "🏠",
  },
  {
    href: "/workout",
    label: "Workout",
    icon: "💪",
  },
  {
    href: "/progress",
    label: "Progress",
    icon: "📈",
  },
  {
    href: "/running",
    label: "Running",
    icon: "🏃",
  },
  {
    href: "/history",
    label: "History",
    icon: "📚",
  },
];

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
        {items.map(
          (item) => {
            const active =
              pathname ===
              item.href;

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
                <span
                  className="text-xl leading-none"
                  aria-hidden="true"
                >
                  {
                    item.icon
                  }
                </span>

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