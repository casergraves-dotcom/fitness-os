"use client";

// ============================================================
// Imports
// ============================================================

import {
  useMemo,
} from "react";

import {
  getBodyCompositionGoalProgress,
  useBodyCompositionGoalProgress,
} from "../hooks/useBodyCompositionGoalProgress";

import {
  useBodyCompositionGoals,
} from "../hooks/useBodyCompositionGoals";

import {
  useBodyCompositionTrends,
} from "../hooks/useBodyCompositionTrends";

import {
  useBodyMeasurements,
} from "../hooks/useBodyMeasurements";

import {
  useLifestyleGoalProgressEvidence,
} from "../hooks/useLifestyleGoalProgressEvidence";

import {
  getCurrentApproachEvidence,
} from "../utils/getCurrentApproachEvidence";

import {
  getCurrentApproachReview,
} from "../utils/getCurrentApproachReview";

import {
  getCurrentProgramReviewPeriod,
} from "../utils/getCurrentProgramReviewPeriod";

import {
  getLifestyleGoalProgressPatterns,
} from "../utils/getLifestyleGoalProgressPatterns";

import {
  getPeriodStrengthRetentionReview,
} from "../utils/getPeriodStrengthRetentionReview";

import {
  getProgressReviewAdherence,
} from "../utils/getProgressReviewAdherence";

import {
  filterRecordsByProgressReviewPeriod,
} from "../utils/getProgressReviewPeriod";

import {
  getRunningProgressTrend,
} from "../utils/getRunningProgressTrend";

import {
  useRunSession,
} from "@/features/running/hooks/useRunSession";

import {
  useMorningCheckIn,
} from "@/features/recovery/hooks/useMorningCheckIn";

import {
  useTrainingActivityCompletions,
} from "@/features/workout/hooks/useTrainingActivityCompletions";

import {
  useTrainingPlanState,
} from "@/features/workout/hooks/useTrainingPlanState";

import {
  useWorkoutHistory,
} from "@/features/workout/hooks/useWorkoutHistory";


// ============================================================
// Helpers
// ============================================================

// ============================================================
// Progress Outcome Summary
// ============================================================

export default function ProgressOutcomeSummary() {
  const {
    loaded:
      measurementsLoaded,

    measurements,
  } =
    useBodyMeasurements();

  const {
    currentGoal,
  } =
    useBodyCompositionGoals();

  const {
    weightTrend,
  } =
    useBodyCompositionTrends(
      measurements
    );

  const goalProgress =
    useBodyCompositionGoalProgress(
      currentGoal,
      weightTrend
    );


  // ----------------------------------------------------------
  // Lifestyle Evidence
  // ----------------------------------------------------------

  const {
    loaded:
      lifestyleEvidenceLoaded,

    evidence:
      lifestyleEvidence,
  } =
    useLifestyleGoalProgressEvidence(
      goalProgress
    );

  const lifestylePatterns =
    useMemo(
      () =>
        lifestyleEvidence
          ? getLifestyleGoalProgressPatterns(
              lifestyleEvidence
            )
          : null,
      [
        lifestyleEvidence,
      ]
    );


  // ----------------------------------------------------------
  // Cardio History
  // ----------------------------------------------------------

  const {
    history:
      runHistory,

    loaded:
      runHistoryLoaded,
  } =
    useRunSession();

  // ----------------------------------------------------------
  // Training History
  // ----------------------------------------------------------

  const {
    state:
      trainingPlanState,

    loaded:
      trainingPlanStateLoaded,
  } =
    useTrainingPlanState();

  const {
    completions:
      trainingActivityCompletions,

    loaded:
      trainingActivityCompletionsLoaded,
  } =
    useTrainingActivityCompletions();

  const {
    history:
      morningCheckInHistory,

    loaded:
      morningCheckInLoaded,
  } =
    useMorningCheckIn();

  const {
    history:
      workoutHistory,

    loaded:
      workoutHistoryLoaded,
  } =
    useWorkoutHistory();

  const adherenceLoaded =
    trainingPlanStateLoaded &&
    trainingActivityCompletionsLoaded &&
    morningCheckInLoaded &&
    workoutHistoryLoaded &&
    runHistoryLoaded;

  // ----------------------------------------------------------
  // Current-Approach Evidence
  // ----------------------------------------------------------

  const currentApproachEvidence =
    useMemo(
      () =>
        getCurrentApproachEvidence({
          trainingPlanState,
          weightTrend,
        }),
      [
        trainingPlanState,
        weightTrend,
      ]
    );

  const currentProgramPeriod =
    useMemo(
      () =>
        getCurrentProgramReviewPeriod({
          evidence:
            currentApproachEvidence,
        }),
      [
        currentApproachEvidence,
      ]
    );

  const currentProgramWeightTrend =
    useMemo(
      () =>
        currentProgramPeriod
          ? filterRecordsByProgressReviewPeriod(
              weightTrend,
              (
                entry
              ) =>
                entry.date,
              currentProgramPeriod
            )
          : [],
      [
        currentProgramPeriod,
        weightTrend,
      ]
    );

  const currentProgramGoalProgress =
    useMemo(
      () =>
        getBodyCompositionGoalProgress(
          currentGoal,
          currentProgramWeightTrend
        ),
      [
        currentGoal,
        currentProgramWeightTrend,
      ]
    );

  const currentProgramStrengthRetention =
    useMemo(
      () =>
        currentProgramPeriod
          ? getPeriodStrengthRetentionReview({
              workoutHistory,
              period:
                currentProgramPeriod,
            })
          : null,
      [
        currentProgramPeriod,
        workoutHistory,
      ]
    );

  const currentProgramRunningTrend =
    useMemo(
      () =>
        currentProgramPeriod
          ? getRunningProgressTrend(
              filterRecordsByProgressReviewPeriod(
                runHistory,
                (
                  run
                ) =>
                  run.completedAt ??
                  "",
                currentProgramPeriod
              )
            )
          : null,
      [
        currentProgramPeriod,
        runHistory,
      ]
    );

  const currentProgramAdherence =
    useMemo(
      () =>
        currentProgramPeriod
          ? getProgressReviewAdherence({
              period:
                currentProgramPeriod,
              trainingPlanState,
              completions:
                trainingActivityCompletions,
              recoveryCheckIns:
                morningCheckInHistory,
              workoutHistory,
              runHistory,
            })
          : null,
      [
        currentProgramPeriod,
        morningCheckInHistory,
        runHistory,
        trainingActivityCompletions,
        trainingPlanState,
        workoutHistory,
      ]
    );

  const currentApproachReview =
    useMemo(
      () =>
        getCurrentApproachReview({
          evidence:
            currentApproachEvidence,
          bodyCompositionStatus:
            currentProgramGoalProgress
              .status,
          strengthRetention:
            currentProgramStrengthRetention,
          runningTrend:
            currentProgramRunningTrend,
          adherence:
            currentProgramAdherence,
        }),
      [
        currentApproachEvidence,
        currentProgramAdherence,
        currentProgramGoalProgress,
        currentProgramRunningTrend,
        currentProgramStrengthRetention,
      ]
    );

  const availableApproachSignals =
    currentApproachReview.signals.filter(
      (signal) =>
        signal.status !==
        "InsufficientData"
    );

  const unavailableApproachSignals =
    currentApproachReview.signals.filter(
      (signal) =>
        signal.status ===
        "InsufficientData"
    );


  // ----------------------------------------------------------
  // Loading
  // ----------------------------------------------------------

  if (
    !measurementsLoaded ||
    !adherenceLoaded ||
    !lifestyleEvidenceLoaded
  ) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <p className="text-sm text-slate-500">
          Evaluating current progress...
        </p>

      </div>
    );
  }


  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">

      <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
        Current Approach
      </p>

      <h3 className="mt-1 text-lg font-bold text-slate-900">
        {
          currentApproachReview.title
        }
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {
          currentApproachReview.message
        }
      </p>


      {availableApproachSignals.length > 0 && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

        {
          availableApproachSignals
            .map(
              (
                signal
              ) => (
                <Signal
                  key={
                    signal.domain
                  }
                  label={
                    signal.domain ===
                    "BodyComposition"
                      ? "Body Composition"
                      : signal.domain
                  }
                  value={
                    signal.label
                  }
                />
              )
            )
        }

        </div>
      )}

      {unavailableApproachSignals.length > 0 && (
        <details className="group mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 marker:hidden">
            <span className="flex items-center justify-between gap-3">
              <span>
                {unavailableApproachSignals.length} {unavailableApproachSignals.length === 1 ? "area needs" : "areas need"} more data
              </span>
              <span aria-hidden="true" className="text-slate-500 transition-transform group-open:rotate-180">
                ⌄
              </span>
            </span>
          </summary>

          <div className="mt-3 divide-y divide-slate-200 border-t border-slate-200 pt-1">
            {unavailableApproachSignals.map((signal) => (
              <div key={signal.domain} className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {signal.domain === "BodyComposition" ? "Body Composition" : signal.domain}
                  </p>
                  <p className="text-sm font-semibold text-slate-900">{signal.label}</p>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-600">{signal.message}</p>
              </div>
            ))}
          </div>
        </details>
      )}


      {/* ====================================================
          Lifestyle Context
      ==================================================== */}

      <div className="mt-6 border-t border-slate-200 pt-5">

        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Lifestyle Context
        </p>

        {!lifestyleEvidence ||
        !lifestylePatterns ||
        !lifestylePatterns.evidenceReady ? (
          <details className="group mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 marker:hidden">
              <span className="flex items-center justify-between gap-3">
                <span>Not enough multi-week evidence yet</span>
                <span aria-hidden="true" className="text-slate-500 transition-transform group-open:rotate-180">
                  ⌄
                </span>
              </span>
            </summary>

            <div className="mt-3 border-t border-slate-200 pt-3">
              <p className="text-sm leading-6 text-slate-600">
                Fitness OS needs sufficient body-composition trend history plus
                consistent nutrition or daily-activity logging before using those
                patterns to help explain goal progress.
              </p>


              {lifestyleEvidence && (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">

                <EvidenceCoverage
                  label="Protein"
                  loggedDays={
                    lifestyleEvidence
                      .nutrition
                      .protein
                      .loggedDays
                  }
                  eligibleDays={
                    lifestyleEvidence
                      .nutrition
                      .protein
                      .eligibleDays
                  }
                  ready={
                    lifestyleEvidence
                      .nutrition
                      .protein
                      .evidenceReady
                  }
                />

                <EvidenceCoverage
                  label="Calories"
                  loggedDays={
                    lifestyleEvidence
                      .nutrition
                      .calories
                      .loggedDays
                  }
                  eligibleDays={
                    lifestyleEvidence
                      .nutrition
                      .calories
                      .eligibleDays
                  }
                  ready={
                    lifestyleEvidence
                      .nutrition
                      .calories
                      .evidenceReady
                  }
                />

                <EvidenceCoverage
                  label="Steps"
                  loggedDays={
                    lifestyleEvidence
                      .activity
                      .steps
                      .loggedDays
                  }
                  eligibleDays={
                    lifestyleEvidence
                      .activity
                      .steps
                      .eligibleDays
                  }
                  ready={
                    lifestyleEvidence
                      .activity
                      .steps
                      .evidenceReady
                  }
                />

              </div>
              )}
            </div>
          </details>
        ) : (
          <div className="mt-3 space-y-3">

            {lifestylePatterns.patterns.length >
            0 ? (
              lifestylePatterns.patterns.map(
                (
                  pattern
                ) => (
                  <div
                    key={
                      pattern.id
                    }
                    className="rounded-xl bg-slate-50 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          {
                            pattern.category
                          }
                        </p>

                        <p className="mt-1 font-semibold text-slate-900">
                          {
                            pattern.summary
                          }
                        </p>
                      </div>

                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                        {
                          formatPatternDirection(
                            pattern.direction
                          )
                        }
                      </span>

                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {
                        pattern.detail
                      }
                    </p>
                  </div>
                )
              )
            ) : (
              <div className="rounded-xl bg-slate-50 p-4">

                <p className="font-semibold text-slate-900">
                  No strong lifestyle pattern stands out
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  There is enough multi-week lifestyle data to evaluate context,
                  but the current evidence does not show a persistent nutrition
                  or daily-activity pattern strong enough to highlight.
                </p>

              </div>
            )}

          </div>
        )}

      </div>


      <p className="mt-5 text-xs leading-5 text-slate-500">
        Historical trends describe the available measurements. Fitness OS only
        evaluates the current approach after enough recent evidence has been
        collected during the active program. Lifestyle patterns are contextual
        evidence, not proof of causation, and should not trigger automatic
        training or target changes from short-term fluctuations.
      </p>

    </div>
  );
}


// ============================================================
// Signal
// ============================================================

function Signal({
  label,
  value,
}: {
  label:
    string;

  value:
    string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {
          label
        }
      </p>

      <p className="mt-1 font-semibold text-slate-900">
        {
          value
        }
      </p>

    </div>
  );
}


// ============================================================
// Evidence Coverage
// ============================================================

function EvidenceCoverage({
  label,
  loggedDays,
  eligibleDays,
  ready,
}: {
  label:
    string;

  loggedDays:
    number;

  eligibleDays:
    number;

  ready:
    boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">

      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {
          label
        }
      </p>

      <p className="mt-1 font-semibold text-slate-900">
        {loggedDays}/{eligibleDays} days
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {
          ready
            ? "Multi-week evidence ready"
            : "More data needed"
        }
      </p>

    </div>
  );
}


// ============================================================
// Pattern Direction
// ============================================================

function formatPatternDirection(
  direction:
    "SupportsGoal" |
    "MayLimitProgress" |
    "MayAccelerateProgress" |
    "ContextOnly"
) {
  switch (
    direction
  ) {
    case "SupportsGoal":
      return "Supports goal";

    case "MayLimitProgress":
      return "May limit progress";

    case "MayAccelerateProgress":
      return "May accelerate progress";

    case "ContextOnly":
    default:
      return "Context";
  }
}
