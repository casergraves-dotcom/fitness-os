import { ReactNode } from "react";

import { Card } from "@/components/ui/card";

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
}

export default function SectionCard({
  title,
  subtitle,
  children,
  className = "",
}: SectionCardProps) {
  return (
    <Card
      className={`rounded-2xl border bg-white p-6 shadow-sm ${className}`}
    >
      {(title || subtitle) && (
        <header className="mb-6">
          {title && (
            <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
              {title}
            </h2>
          )}

          {subtitle && (
            <p className="mt-2 text-sm text-slate-500">
              {subtitle}
            </p>
          )}
        </header>
      )}

      {children}
    </Card>
  );
}