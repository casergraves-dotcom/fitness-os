import {
  Card,
} from "@/components/ui/card";

import type {
  TrainingActivity,
} from "@/features/workout/types";

import type {
  Mission,
} from "../types";


// ============================================================
// Props
// ============================================================

interface MissionCardProps {
  mission: Mission;

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


// ============================================================
// Mission Card
// ============================================================

export default function MissionCard({
  mission,
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

        {trainingActivities.map(
          (activity) => {
            const completed =
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

              </div>
            );
          }
        )}


        {/* ==================================================
            Protein
        ================================================== */}

        <div className="flex items-center gap-3">

          <div className="h-5 w-5 shrink-0 rounded-full border-2 border-slate-300" />

          <span className="text-slate-800">
            {mission.proteinGoal}g Protein
          </span>

        </div>


        {/* ==================================================
            Steps
        ================================================== */}

        <div className="flex items-center gap-3">

          <div className="h-5 w-5 shrink-0 rounded-full border-2 border-slate-300" />

          <span className="text-slate-800">
            {mission.stepGoal.toLocaleString()} Steps
          </span>

        </div>

      </div>

    </Card>
  );
}