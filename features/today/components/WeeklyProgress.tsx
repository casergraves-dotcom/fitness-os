import {
  Card,
} from "@/components/ui/card";

import type {
  CurrentWeeklyProgress,
} from "../utils/getCurrentWeeklyProgress";

// ============================================================
// Props
// ============================================================

interface WeeklyProgressProps {
  progress:
    CurrentWeeklyProgress | null;

  loaded:
    boolean;
}

// ============================================================
// Progress Row
// ============================================================

function ProgressRow({
  label,
  valueLabel,
  percent,
}: {
  label: string;
  valueLabel: string;
  percent: number;
}) {
  const safePercent =
    Math.max(
      0,
      Math.min(
        percent,
        100
      )
    );

  return (
    <div className="space-y-2">
      <div className="flex justify-between gap-4 text-sm">
        <span className="font-medium text-slate-800">
          {label}
        </span>

        <span className="text-slate-500">
          {valueLabel}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{
            width:
              `${safePercent}%`,
          }}
        />
      </div>
    </div>
  );
}

// ============================================================
// Status
// ============================================================

function getStatus(
  progress: CurrentWeeklyProgress
) {
  const {
    adherence,
    decision,
    evaluationReady,
    weekType,
  } = progress;

  if (
    weekType ===
    "Deload"
  ) {
    return {
      title:
        "Deload week",

      detail:
        "Recovery is the priority this week. The plan returns to steady-state training after the deload.",
    };
  }

  if (
    adherence.allRequiredCompleted
  ) {
    if (
      decision.status ===
      "Advance"
    ) {
      return {
        title:
          "On track to advance",

        detail:
          "All required training for the week is complete.",
      };
    }

    if (
      decision.status ===
      "AdvanceWithWarning"
    ) {
      return {
        title:
          "On track to advance",

        detail:
          decision.reason,
      };
    }

    return {
      title:
        "Progression target not met",

      detail:
        decision.reason,
    };
  }

  if (evaluationReady) {
    if (
      decision.status ===
      "Advance"
    ) {
      return {
        title:
          "On track to advance",

        detail:
          decision.reason,
      };
    }

    if (
      decision.status ===
      "AdvanceWithWarning"
    ) {
      return {
        title:
          "Likely to advance with reduced adherence",

        detail:
          decision.reason,
      };
    }

    return {
      title:
        "Currently below progression target",

      detail:
        decision.reason,
    };
  }

  const remaining =
    Math.max(
      0,
      adherence.requiredCount -
        adherence.requiredCompleted
    );

  return {
    title:
      "Week in progress",

    detail:
      remaining === 1
        ? "1 required training activity remains this week."
        : `${remaining} required training activities remain this week.`,
  };
}

// ============================================================
// Weekly Progress
// ============================================================

export default function WeeklyProgress({
  progress,
  loaded,
}: WeeklyProgressProps) {
  // ----------------------------------------------------------
  // Loading
  // ----------------------------------------------------------

  if (!loaded) {
    return (
      <Card className="rounded-2xl p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
          This Week
        </p>

        <p className="mt-5 text-sm text-slate-500">
          Loading weekly progress...
        </p>
      </Card>
    );
  }

  // ----------------------------------------------------------
  // No Active Week
  // ----------------------------------------------------------

  if (!progress) {
    return (
      <Card className="rounded-2xl p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
          This Week
        </p>

        <p className="mt-5 text-sm text-slate-600">
          Start your training plan to track weekly progress.
        </p>
      </Card>
    );
  }

  const {
    adherence,
    decision,
  } = progress;

  const status =
    getStatus(
      progress
    );

  const adherencePercent =
    Math.round(
      adherence.adherenceRate *
        100
    );

  const strengthPercent =
    decision.scheduledStrengthCount ===
      0
      ? 0
      : (
          decision.completedStrengthCount /
          decision.scheduledStrengthCount
        ) * 100;

  const optionalPercent =
    adherence.optionalCount === 0
      ? 0
      : (
          adherence.optionalCompleted /
          adherence.optionalCount
        ) * 100;

  const showDecisionEvidence =
    progress.evaluationReady ||
    adherence.allRequiredCompleted;

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  return (
    <Card className="rounded-2xl p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
        This Week
      </p>

      <div className="mt-5 rounded-xl bg-slate-50 p-4">
        <p className="font-semibold text-slate-900">
          {status.title}
        </p>

        <p className="mt-1 text-sm text-slate-600">
          {status.detail}
        </p>

        {showDecisionEvidence &&
          decision.factors.length > 0 && (
          <div className="mt-3 border-t border-slate-200 pt-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Why this decision
            </p>

            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              {decision.factors.map(
                (factor) => (
                  <li
                    key={factor}
                    className="flex gap-2"
                  >
                    <span
                      aria-hidden="true"
                      className="text-blue-600"
                    >
                      •
                    </span>

                    <span>
                      {factor}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-5 space-y-5">
        <ProgressRow
          label="Plan adherence"
          valueLabel={
            `${adherencePercent}%`
          }
          percent={
            adherencePercent
          }
        />

        <ProgressRow
          label="Required training"
          valueLabel={
            `${adherence.requiredCompleted}/${adherence.requiredCount}`
          }
          percent={
            adherence.adherenceRate *
            100
          }
        />

        {decision.scheduledStrengthCount >
          0 && (
          <ProgressRow
            label="Strength sessions"
            valueLabel={
              `${decision.completedStrengthCount}/${decision.scheduledStrengthCount}`
            }
            percent={
              strengthPercent
            }
          />
        )}

        {adherence.optionalCount >
          0 && (
          <ProgressRow
            label="Optional training"
            valueLabel={
              `${adherence.optionalCompleted}/${adherence.optionalCount}`
            }
            percent={
              optionalPercent
            }
          />
        )}
      </div>
    </Card>
  );
}
