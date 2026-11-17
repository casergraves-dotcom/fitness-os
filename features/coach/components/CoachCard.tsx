"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type {
  CoachRecommendation,
} from "../types";
import type { DailyTrainingChoice } from "../getDailyTrainingChoices";
import type { ActivityBarrierReason } from "../coachingPreferences";
import {
  ACTIVITY_BARRIER_OPTIONS,
  getActivityBarrierGuidance,
} from "../getActivityBarrierGuidance";
import type { ActivityBarrierPrompt } from "../getActivityBarrierGuidance";

interface CoachCardProps {
  recommendation: CoachRecommendation;
  showAction?: boolean;
  dailyChoices?: DailyTrainingChoice[];
  onChooseTraining?: (choice: DailyTrainingChoice) => void;
  activityBarrierPrompt?: ActivityBarrierPrompt | null;
  onActivityBarrierResponse?: (
    activityId: string,
    activityLabel: string,
    reason: ActivityBarrierReason
  ) => void;
}

export default function CoachCard({
  recommendation,
  showAction = true,
  dailyChoices = [],
  onChooseTraining,
  activityBarrierPrompt,
  onActivityBarrierResponse,
}: CoachCardProps) {
  const [observationsOpen, setObservationsOpen] = useState(false);
  const [choicesOpen, setChoicesOpen] = useState(false);
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
    <div className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
      <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
        Today&apos;s Recommendation
      </p>

      <h2 className="text-2xl font-bold">
        {recommendation.title}
      </h2>

      <p className="mt-3 text-slate-600">
        {recommendation.message}
      </p>

      {dailyChoices.length > 0 && (
        <div className="mt-5 border-t border-slate-200 pt-4">
          <button
            type="button"
            aria-expanded={choicesOpen}
            onClick={() => setChoicesOpen((open) => !open)}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <span>
              <span className="block text-sm font-semibold text-blue-600">
                Give me some choices
              </span>
              <span className="mt-1 block text-xs text-slate-500">
                Pick from safe, flexible training still available this week.
              </span>
            </span>
            <ChevronDown
              size={18}
              className={
                choicesOpen
                  ? "rotate-180 text-slate-500 transition-transform"
                  : "text-slate-500 transition-transform"
              }
            />
          </button>

          {choicesOpen && (
            <div className="mt-3 space-y-2">
              {dailyChoices.map((choice) => (
                <div
                  key={`${choice.activityId}-${choice.originalDate}`}
                  className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{choice.label}</p>
                    <p className="text-xs text-slate-500">
                      {choice.isScheduledToday
                        ? "Already scheduled today"
                        : `Move from ${new Date(`${choice.scheduledDate}T12:00:00`).toLocaleDateString(undefined, { weekday: "long" })}`}
                      {choice.optional ? " · Optional" : " · Weekly priority"}
                    </p>
                  </div>
                  {!choice.isScheduledToday && onChooseTraining && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onChooseTraining(choice)}
                    >
                      Choose
                    </Button>
                  )}
                </div>
              ))}
              <p className="text-xs text-slate-500">
                Choosing moves the existing activity to today; it does not add
                another session.
              </p>
            </div>
          )}
        </div>
      )}

      {activityBarrierPrompt && (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
            Help Guide adjust
          </p>
          {activityBarrierPrompt.feedback ? (
            <>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                Thanks—Guide saved what is getting in the way for {activityBarrierPrompt.activityLabel}.
              </p>
              {getActivityBarrierGuidance(activityBarrierPrompt.feedback.reason) && (
                <p className="mt-2 text-sm text-slate-600">
                  {getActivityBarrierGuidance(activityBarrierPrompt.feedback.reason)}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {activityBarrierPrompt.question}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Optional. Your answer guides recommendations but does not change the plan automatically.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {ACTIVITY_BARRIER_OPTIONS.map((option) => (
                  <Button
                    key={option.reason}
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      onActivityBarrierResponse?.(
                        activityBarrierPrompt.activityId,
                        activityBarrierPrompt.activityLabel,
                        option.reason
                      )
                    }
                  >
                    {option.label}
                  </Button>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    onActivityBarrierResponse?.(
                      activityBarrierPrompt.activityId,
                      activityBarrierPrompt.activityLabel,
                      "NotNow"
                    )
                  }
                >
                  Not now
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {recommendation.observations && recommendation.observations.length > 0 && (
        <div className="mt-5 border-t border-slate-200 pt-4">
          <button
            type="button"
            aria-expanded={observationsOpen}
            onClick={() => setObservationsOpen((open) => !open)}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <span>
              <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Supporting details
              </span>
              <span className="mt-1 block text-sm text-slate-600">
                {recommendation.observations.length} contextual {recommendation.observations.length === 1 ? "observation" : "observations"}
              </span>
            </span>
            <ChevronDown
              size={18}
              className={observationsOpen ? "rotate-180 text-slate-500 transition-transform" : "text-slate-500 transition-transform"}
            />
          </button>

          {observationsOpen && (
            <div className="mt-3">
              <div className="space-y-2">
                {recommendation.observations.map((observation) => (
                  <div
                    key={`${observation.type}-${observation.label}`}
                    className="rounded-xl bg-slate-50 p-3"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {observation.type === "CompletedReview"
                        ? "Last Completed Review"
                        : observation.type === "PersistentPattern"
                          ? "Persistent Pattern"
                          : "Nutrition & Activity Context"}
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
        </div>
      )}

    {showAction && recommendation.button &&
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
