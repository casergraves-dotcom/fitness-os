"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type {
  CoachRecommendation,
} from "../types";

interface CoachCardProps {
  recommendation: CoachRecommendation;
}

export default function CoachCard({
  recommendation,
}: CoachCardProps) {
  const actionHref = (() => {
    if (
      recommendation.strengthWorkout &&
      recommendation.strengthVariant
    ) {
      const params =
        new URLSearchParams();

      params.set(
        "start",
        recommendation.strengthWorkout
      );

      params.set(
        "variantType",
        recommendation.strengthVariant
      );

      return `/workout?${params.toString()}`;
    }

    return recommendation.href;
  })();

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

      {recommendation.reviewContext && (
        <div className="mt-4 rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Last Completed Review · {recommendation.reviewContext.label}
          </p>

          <p className="mt-1 text-sm text-slate-600">
            {recommendation.reviewContext.message}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Historical review context does not override today&apos;s schedule or recovery guidance.
          </p>
        </div>
      )}

      {recommendation.patternContext && (
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
            Persistent Pattern · {recommendation.patternContext.label}
          </p>

          <p className="mt-1 text-sm text-slate-600">
            {recommendation.patternContext.message}
          </p>
        </div>
      )}

    {recommendation.button &&
      actionHref && (
        <Link
          href={actionHref}
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
