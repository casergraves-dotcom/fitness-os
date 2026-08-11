import {
  Card,
} from "@/components/ui/card";

import type {
  TrainingActivity,
} from "@/features/workout/types";

// ============================================================
// Props
// ============================================================

interface MissionCardProps {
  trainingActivities?: TrainingActivity[];

  trainingDate?: string;

  isActivityCompleted?: (
    trainingActivityId: string,
    date: string
  ) => boolean;
}

// ============================================================
// Helpers
// ============================================================

function getDurationLabel(
  activity: TrainingActivity
) {
  const {
    durationMin,
    durationMax,
  } = activity;

  if (
    durationMin === undefined &&
    durationMax === undefined
  ) {
    return "";
  }

  if (
    durationMin !== undefined &&
    durationMax !== undefined &&
    durationMin !== durationMax
  ) {
    return ` · ${durationMin}–${durationMax} min`;
  }

  const duration =
    durationMin ??
    durationMax;

  return ` · ${duration} min`;
}

// ------------------------------------------------------------
// Training Activity Label
// ------------------------------------------------------------

function getTrainingActivityLabel(
  activity: TrainingActivity
) {
  return `${activity.label}${getDurationLabel(
    activity
  )}`;
}

// ------------------------------------------------------------
// Completion Behavior
// ------------------------------------------------------------

function isCompletableActivity(
  activity: TrainingActivity
) {
  return (
    activity.type !== "Rest" &&
    activity.type !== "Recovery"
  );
}

// ============================================================
// Mission Card
// ============================================================

export default function MissionCard({
  trainingActivities = [],
  trainingDate,
  isActivityCompleted,
}: MissionCardProps) {
  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  return (
    <Card className="p-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
        Today&apos;s Mission
      </p>

      <div className="mt-6 space-y-3">
        {/* ==================================================
            Training
        ================================================== */}

        {trainingActivities.length > 0 ? (
          trainingActivities.map(
            (activity) => {
              const completable =
                isCompletableActivity(
                  activity
                );

              const completed =
                completable &&
                trainingDate !== undefined &&
                isActivityCompleted !== undefined
                  ? isActivityCompleted(
                      activity.id,
                      trainingDate
                    )
                  : false;

              return (
                <div
                  key={
                    activity.id
                  }
                  className="flex items-center gap-3"
                >
                  {/* ========================================
                      Status
                  ======================================== */}

                  {completable ? (
                    <div
                      className={
                        completed
                          ? "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white"
                          : "h-5 w-5 shrink-0 rounded-full border-2 border-slate-300"
                      }
                    >
                      {completed &&
                        "✓"}
                    </div>
                  ) : (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center text-sm text-slate-400">
                      —
                    </div>
                  )}

                  {/* ========================================
                      Activity
                  ======================================== */}

                  <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                    <span
                      className={
                        completed
                          ? "text-slate-500 line-through"
                          : "text-slate-800"
                      }
                    >
                      {
                        getTrainingActivityLabel(
                          activity
                        )
                      }
                    </span>

                    {activity.optional && (
                      <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">
                        Optional
                      </span>
                    )}
                  </div>
                </div>
              );
            }
          )
        ) : (
          <p className="text-slate-600">
            No training activities scheduled for today.
          </p>
        )}
      </div>
    </Card>
  );
}