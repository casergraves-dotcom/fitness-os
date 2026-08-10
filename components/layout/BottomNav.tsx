"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/today", label: "Today", icon: "🏠" },
  { href: "/workout", label: "Workout", icon: "💪" },
  { href: "/progress", label: "Progress", icon: "📈" },
  { href: "/running", label: "Running", icon: "🏃" },
  { href: "/history", label: "History", icon: "📚" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-white z-50">
      <div className="mx-auto flex max-w-5xl justify-around py-3">
        {items.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center text-xs transition ${
                active
                  ? "font-semibold text-blue-600"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}