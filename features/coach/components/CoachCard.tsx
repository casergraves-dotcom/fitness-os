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