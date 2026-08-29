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
        Today&apos;s Recommendation
      </p>

      <h2 className="text-2xl font-bold">
        {recommendation.title}
      </h2>

      <p className="mt-3 text-slate-600">
        {recommendation.message}
      </p>

      {recommendation.observations && recommendation.observations.length > 0 && (
        <div className="mt-5 border-t border-slate-200 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Observations
          </p>

          <div className="mt-2 space-y-2">
            {recommendation.observations.map((observation) => (
              <div
                key={`${observation.type}-${observation.label}`}
                className="rounded-xl bg-slate-50 p-3"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {observation.type === "CompletedReview"
                    ? "Last Completed Review"
                    : "Persistent Pattern"}
                  {" · "}
                  {observation.label}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {observation.message}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Observations provide context. They do not override today&apos;s schedule or recovery guidance.
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
