"use client";

// ============================================================
// Imports
// ============================================================

import {
  useMemo,
} from "react";

import {
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
  useExerciseProgress,
} from "../hooks/useExerciseProgress";

import {
  useLifestyleGoalProgressEvidence,
} from "../hooks/useLifestyleGoalProgressEvidence";

import {
  getLifestyleGoalProgressPatterns,
} from "../utils/getLifestyleGoalProgressPatterns";

import {
  useRunSession,
} from "@/features/running/hooks/useRunSession";

import {
  getCurrentWeeklyProgress,
} from "@/features/today/utils/getCurrentWeeklyProgress";

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

function getBodyCompositionMessage(
  status:
    string
) {
  switch (
    status
  ) {
    case "OnTrack":
      return "Body-composition progress is moving in the intended direction.";

    case "FasterThanExpected":
      return "Body-composition progress is moving faster than planned.";

    case "SlowerThanExpected":
      return "Body-composition progress is moving toward the goal, but slower than planned.";

    case "Plateau":
      return "The recent body-composition trend appears relatively flat.";

    case "MovingAwayFromGoal":
      return "The recent body-composition trend is moving away from the current goal.";

    default:
      return "There is not enough body-composition trend data yet to judge progress confidently.";
  }
}


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
  // Strength
  // ----------------------------------------------------------

  const {
    exercises,
  } =
    useExerciseProgress();

  const primaryExercise =
    exercises[0];

  const {
    progress:
      strengthProgress,
  } =
    useExerciseProgress(
      primaryExercise
    );


  const strengthChange =
    useMemo(
      () => {
        if (
          strengthProgress.length <
          2
        ) {
          return undefined;
        }

        const first =
          strengthProgress[0]
            .estimatedOneRepMax;

        const latest =
          strengthProgress[
            strengthProgress.length -
            1
          ].estimatedOneRepMax;

        if (
          first ===
          0
        ) {
          return undefined;
        }

        return (
          (
            latest -
            first
          ) /
          first
        ) *
          100;
      },
      [
        strengthProgress,
      ]
    );


  // ----------------------------------------------------------
  // Cardio
  // ----------------------------------------------------------

  const {
    history:
      runHistory,

    loaded:
      runHistoryLoaded,
  } =
    useRunSession();


  const runsWithPace =
    useMemo(
      () =>
        runHistory.filter(
          (
            run
          ) =>
            run.durationMinutes !==
              undefined &&
            run.durationMinutes >
              0 &&
            run.distanceMiles !==
              undefined &&
            run.distanceMiles >
              0
        ),
      [
        runHistory,
      ]
    );


  const paceChange =
    useMemo(
      () => {
        if (
          runsWithPace.length <
          2
        ) {
          return undefined;
        }

        const chronological =
          [
            ...runsWithPace,
          ].sort(
            (
              a,
              b
            ) =>
              (
                a.completedAt ??
                a.startedAt
              ).localeCompare(
                b.completedAt ??
                  b.startedAt
              )
          );

        const first =
          chronological[0];

        const latest =
          chronological[
            chronological.length -
            1
          ];

        const firstPace =
          first.durationMinutes! /
          first.distanceMiles!;

        const latestPace =
          latest.durationMinutes! /
          latest.distanceMiles!;

        if (
          firstPace ===
          0
        ) {
          return undefined;
        }

        return (
          (
            firstPace -
            latestPace
          ) /
          firstPace
        ) *
          100;
      },
      [
        runsWithPace,
      ]
    );


  // ----------------------------------------------------------
  // Training Adherence
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


  const weeklyProgress =
    adherenceLoaded
      ? getCurrentWeeklyProgress(
          trainingPlanState,
          trainingActivityCompletions,
          new Date(),
          morningCheckInHistory,
          workoutHistory,
          runHistory
        )
      : null;


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
  // Current Approach
  // ----------------------------------------------------------

  const bodyCompositionPositive =
    goalProgress.status ===
      "OnTrack" ||
    goalProgress.status ===
      "FasterThanExpected" ||
    goalProgress.status ===
      "SlowerThanExpected";

  const strengthPositive =
    strengthChange ===
      undefined ||
    strengthChange >=
      -5;

  const cardioPositive =
    paceChange ===
      undefined ||
    paceChange >=
      -5;

  const adherencePositive =
    weeklyProgress?.evaluationReady
      ? weeklyProgress
          .adherence
          .adherenceRate >=
        0.75
      : true;


  const enoughEvidence =
    goalProgress.status !==
    "InsufficientData";


  const working =
    enoughEvidence &&
    bodyCompositionPositive &&
    strengthPositive &&
    cardioPositive &&
    adherencePositive;


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
          !enoughEvidence
            ? "Not enough evidence yet"
            : working
              ? "The current approach appears to be working"
              : "The current approach may need attention"
        }
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {
          getBodyCompositionMessage(
            goalProgress.status
          )
        }
      </p>


      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

        <Signal
          label="Body Composition"
          value={
            bodyCompositionPositive
              ? "Positive"
              : "Needs attention"
          }
        />

        <Signal
          label="Strength"
          value={
            strengthChange ===
            undefined
              ? "Not enough data"
              : strengthPositive
                ? "Maintained"
                : "Declining"
          }
        />

        <Signal
          label="Cardio"
          value={
            paceChange ===
            undefined
              ? "Not enough data"
              : cardioPositive
                ? "Maintained"
                : "Declining"
          }
        />

        <Signal
          label="Adherence"
          value={
            weeklyProgress?.adherence
              ? `${Math.round(
                  weeklyProgress
                    .adherence
                    .adherenceRate *
                  100
                )}%`
              : "Not enough data"
          }
        />

      </div>


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
          <div className="mt-3 rounded-xl bg-slate-50 p-4">

            <p className="font-semibold text-slate-900">
              Not enough multi-week lifestyle evidence yet
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
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
        This summary uses longer-term body-composition trend data and supporting
        training and lifestyle context. Lifestyle patterns are contextual
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