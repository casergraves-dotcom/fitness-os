"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { CoachRecommendation } from "../engine/coachEngine";

interface CoachCardProps {
  recommendation: CoachRecommendation;
}

export default function CoachCard({
  recommendation,
}: CoachCardProps) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
        Coach
      </p>

      <h2 className="text-2xl font-bold">
        {recommendation.title}
      </h2>

      <p className="mt-3 text-slate-600">
        {recommendation.message}
      </p>

    {recommendation.button &&
      recommendation.href && (
        <Link
          href={recommendation.href}
          className={cn(
            buttonVariants(),
            "mt-6 w-full"
          )}
        >
          {recommendation.button}
        </Link>
      )}
    </div>
  );
}