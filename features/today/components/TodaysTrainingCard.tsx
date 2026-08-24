"use client";

import Link from "next/link";

import {
  useState,
} from "react";

import type {
  TrainingActivity,
  TrainingPlanState,
} from "@/features/workout/types";

import type {
  TrainingScheduleForDate,
} from "@/features/workout/utils/getTrainingScheduleForDate";

import {
  currentHomeWorkoutCapabilities,
  currentHomeWorkoutEquipment,
  getStrengthWorkoutVariants,
  isStrengthWorkoutVariantAvailable,
} from "@/features/workout/backupWorkoutModel";

import type {
  StrengthWorkoutType,
  StrengthWorkoutVariant,
} from "@/features/workout/types";


// ============================================================
// Props
// ============================================================

interface TodaysTrainingCardProps {
  schedule:
    TrainingScheduleForDate | null;

  trainingPlanState:
    TrainingPlanState | null;

  loaded: boolean;

  isActivityCompleted: (
    trainingActivityId: string,
    date: string
  ) => boolean;

  onCompleteActivity: (
    activity: TrainingActivity
  ) => void;

  onRemoveActivityCompletion: (
    activityId: string
  ) => void;

  onRescheduleActivity: (
    activity: TrainingActivity,
    scheduledDate: string
  ) => void;

  onStartPlan: () => void;

  onResetPlan: () => void;
}


// ============================================================
// Helpers
// ============================================================

function getPhaseLabel(
  schedule: TrainingScheduleForDate,
  trainingPlanState: TrainingPlanState
) {
  // ----------------------------------------------------------
  // Deload
  // ----------------------------------------------------------

  if (
    schedule.isDeload ||
    schedule.weekType === "Deload"
  ) {
    return {
      eyebrow:
        "Deload Week",

      detail:
        "Recovery Week",

      message:
        "Training volume is reduced this week so you can recover before returning to normal steady-state training.",
    };
  }


  // ----------------------------------------------------------
  // Ramp
  // ----------------------------------------------------------

  if (
    schedule.weekType === "Ramp"
  ) {
    return {
      eyebrow:
        `Week ${schedule.programWeek} · ${schedule.phaseName}`,

      detail:
        "Ramp Phase",

      message:
        schedule.isRepeatedWeek
          ? "This week is being repeated so you can build consistency before progressing."
          : "Build consistency and let the program progress gradually as your training routine develops.",
    };
  }


  // ----------------------------------------------------------
  // Steady State
  // ----------------------------------------------------------

  const completedSteadyWeeks =
    trainingPlanState
      .successfulSteadyStateWeeks ??
    0;

  const weeksUntilDeload =
    Math.max(
      0,
      7 -
        completedSteadyWeeks
    );

  let message: string;

  if (
    schedule.isRepeatedWeek
  ) {
    message =
      "This steady-state week is being repeated. Complete the required training to continue the deload cycle.";
  } else if (
    weeksUntilDeload === 0
  ) {
    message =
      "Your next deload has been scheduled.";
  } else if (
    weeksUntilDeload === 1
  ) {
    message =
      "1 successful week remains before your next deload.";
  } else {
    message =
      `${weeksUntilDeload} successful weeks remain before your next deload.`;
  }

  return {
    eyebrow:
      `Steady State · Week ${
        Math.min(
          completedSteadyWeeks + 1,
          7
        )
      } of 7`,

    detail:
      "Steady State",

    message,
  };
}


// ------------------------------------------------------------
// Activity Description
// ------------------------------------------------------------

function getActivityDescription(
  activity: TrainingActivity
) {
  if (
    activity.type === "Strength"
  ) {
    return "Full-body strength";
  }

  if (
    activity.type === "Run"
  ) {
    if (
      activity.cardioIntensity
    ) {
      return `${activity.cardioIntensity} run`;
    }

    return "Running";
  }

  if (
    activity.type === "Walk"
  ) {
    return "Walking";
  }

  if (
    activity.type === "Aerial"
  ) {
    return "Aerial training";
  }

  if (
    activity.type === "Mobility"
  ) {
    return "Mobility";
  }

  if (
    activity.type === "Recovery"
  ) {
    return "Recovery";
  }

  return activity.type;
}


// ------------------------------------------------------------
// Duration
// ------------------------------------------------------------

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
    return null;
  }

  if (
    durationMin !== undefined &&
    durationMax !== undefined &&
    durationMin !== durationMax
  ) {
    return `${durationMin}–${durationMax} min`;
  }

  const duration =
    durationMin ??
    durationMax;

  return `${duration} min`;
}


// ============================================================
// Strength Variant Options
// ============================================================

function getVariantName(
  variant: StrengthWorkoutVariant
) {
  if (
    variant.variantType ===
    "ShortGym"
  ) {
    return "Short Gym";
  }

  if (
    variant.variantType ===
    "Home"
  ) {
    return "Home";
  }

  return variant.label;
}


function getVariantDescription(
  variant: StrengthWorkoutVariant
) {
  const duration =
    variant.durationMin !== undefined &&
    variant.durationMax !== undefined
      ? `${variant.durationMin}–${variant.durationMax} min`
      : variant.durationMin !== undefined
        ? `${variant.durationMin} min`
        : variant.durationMax !== undefined
          ? `${variant.durationMax} min`
          : null;

  if (
    variant.variantType ===
    "ShortGym"
  ) {
    return [
      duration,
      "Reduced volume",
    ]
      .filter(Boolean)
      .join(" · ");
  }

  if (
    variant.variantType ===
    "Home"
  ) {
    return [
      duration,
      "Bands + bodyweight",
    ]
      .filter(Boolean)
      .join(" · ");
  }

  return duration ?? "";
}


// ============================================================
// Component
// ============================================================

export default function TodaysTrainingCard({
  schedule,
  trainingPlanState,
  loaded,
  isActivityCompleted,
  onCompleteActivity,
  onRemoveActivityCompletion,
  onRescheduleActivity,
  onStartPlan,
  onResetPlan,
}: TodaysTrainingCardProps) {
  const [
    expandedStrengthActivityId,
    setExpandedStrengthActivityId,
  ] = useState<string | null>(
    null
  );

  // ----------------------------------------------------------
  // Activity Rescheduling
  // ----------------------------------------------------------

  const [
    reschedulingActivity,
    setReschedulingActivity,
  ] = useState<TrainingActivity | null>(
    null
  );

  const [
    rescheduleDate,
    setRescheduleDate,
  ] = useState("");

  function openReschedule(
    activity: TrainingActivity
  ) {
    setReschedulingActivity(
      activity
    );

    setRescheduleDate("");
  }

  function cancelReschedule() {
    setReschedulingActivity(
      null
    );

    setRescheduleDate("");
  }

  function confirmReschedule() {
    if (
      !reschedulingActivity ||
      !rescheduleDate
    ) {
      return;
    }

    onRescheduleActivity(
      reschedulingActivity,
      rescheduleDate
    );

    cancelReschedule();
  }

  // ----------------------------------------------------------
  // Reset Plan Confirmation
  // ----------------------------------------------------------

  const [
    resetConfirmationOpen,
    setResetConfirmationOpen,
  ] = useState(false);

  function requestPlanReset() {
    setResetConfirmationOpen(true);
  }

  function cancelPlanReset() {
    setResetConfirmationOpen(false);
  }

  function confirmPlanReset() {
    setResetConfirmationOpen(false);
    onResetPlan();
  }

  // ----------------------------------------------------------
  // Reset Plan Confirmation UI
  // ----------------------------------------------------------

  const resetPlanConfirmation =
    resetConfirmationOpen ? (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
        role="presentation"
        onMouseDown={
          (event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              cancelPlanReset();
            }
          }
        }
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-plan-title"
          aria-describedby="reset-plan-description"
          className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">
            Training Plan
          </p>

          <h2
            id="reset-plan-title"
            className="mt-1 text-xl font-bold text-slate-900"
          >
            Reset your training plan?
          </h2>

          <div
            id="reset-plan-description"
            className="mt-4 space-y-3 text-sm text-slate-600"
          >
            <p>
              This resets your active training-plan schedule and progression so you can start the plan again.
            </p>

            <p className="font-medium text-slate-800">
              Your workout history, run history, morning check-ins, and previously completed historical data are preserved.
            </p>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={
                cancelPlanReset
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Keep Plan
            </button>

            <button
              type="button"
              onClick={
                confirmPlanReset
              }
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Reset Plan
            </button>
          </div>
        </div>
      </div>
    ) : null;

  // ----------------------------------------------------------
  // Activity Reschedule UI
  // ----------------------------------------------------------

  const rescheduleConfirmation =
    reschedulingActivity ? (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
        role="presentation"
        onMouseDown={
          (event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              cancelReschedule();
            }
          }
        }
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reschedule-activity-title"
          aria-describedby="reschedule-activity-description"
          className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Move Activity
          </p>

          <h2
            id="reschedule-activity-title"
            className="mt-1 text-xl font-bold text-slate-900"
          >
            Move {reschedulingActivity.label}
          </h2>

          <p
            id="reschedule-activity-description"
            className="mt-3 text-sm text-slate-600"
          >
            Choose another date for this scheduled activity. Its training prescription and activity identity will be preserved.
          </p>

          <label className="mt-5 block text-sm font-semibold text-slate-700">
            New date
            <input
              type="date"
              value={
                rescheduleDate
              }
              min={
                schedule?.date
              }
              onChange={
                (event) =>
                  setRescheduleDate(
                    event.target.value
                  )
              }
              className="mt-2 block w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900"
            />
          </label>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={
                cancelReschedule
              }
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={
                !rescheduleDate
              }
              onClick={
                confirmReschedule
              }
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Move Activity
            </button>
          </div>
        </div>
      </div>
    ) : null;


  // ----------------------------------------------------------
  // Loading
  // ----------------------------------------------------------

  if (!loaded) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Today&apos;s Training
        </p>

        <p className="mt-4 text-sm text-slate-500">
          Loading training plan...
        </p>

      </section>
    );
  }


  // ----------------------------------------------------------
  // No Training Plan
  // ----------------------------------------------------------

  if (!trainingPlanState) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Today&apos;s Training
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-900">
          Start Your Training Plan
        </h2>

        <p className="mt-3 text-sm text-slate-600">
          Start Week 0 to begin your Fitness OS training progression.
        </p>

        <button
          type="button"
          onClick={
            onStartPlan
          }
          className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Start Week 0
        </button>

      </section>
    );
  }


  // ----------------------------------------------------------
  // Invalid Schedule
  // ----------------------------------------------------------

  if (!schedule) {
    return (
      <>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-start justify-between gap-4">

          <div>

            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Today&apos;s Training
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Schedule Unavailable
            </h2>

          </div>


          <button
            type="button"
            onClick={
              requestPlanReset
            }
            className="text-sm text-slate-500 underline"
          >
            Reset Plan
          </button>

        </div>


        <p className="mt-4 text-sm text-red-600">
          No training schedule could be resolved for today.
        </p>

        </section>

        {resetPlanConfirmation}
      </>
    );
  }


  // ----------------------------------------------------------
  // Phase Information
  // ----------------------------------------------------------

  const phase =
    getPhaseLabel(
      schedule,
      trainingPlanState
    );


  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      {/* ====================================================
          Header
      ==================================================== */}

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Today&apos;s Training
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {phase.eyebrow}
          </h2>

        </div>


        <button
          type="button"
          onClick={
            requestPlanReset
          }
          className="text-sm text-slate-500 underline"
        >
          Reset Plan
        </button>

      </div>


      {/* ====================================================
          Status
      ==================================================== */}

      <div className="mt-5 flex flex-wrap items-center gap-2">

        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          {phase.detail}
        </span>


        {schedule.isRepeatedWeek && (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            Repeating Week
          </span>
        )}


        {schedule.isDeload && (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Reduced Volume
          </span>
        )}

      </div>


      {/* ====================================================
          Day / Guidance
      ==================================================== */}

      <div className="mt-5">

        <p className="text-sm text-slate-500">
          {schedule.dayOfWeek}
        </p>

        <p className="mt-2 text-sm text-slate-600">
          {phase.message}
        </p>

      </div>


      {/* ====================================================
          Activities
      ==================================================== */}

      <div className="mt-5 space-y-3">

        {schedule.trainingDay.activities.map(
          (
            activity
          ) => {
            const completed =
              isActivityCompleted(
                activity.id,
                schedule.date
              );

            const duration =
              getDurationLabel(
                activity
              );

            const isStrength =
              activity.type ===
              "Strength";

            const isRun =
              activity.type ===
              "Run";

            const isManualActivity =
              !isStrength &&
              !isRun;

            const strengthWorkout =
              activity.strengthWorkout as
                | StrengthWorkoutType
                | undefined;

            const strengthVariants =
              strengthWorkout
                ? getStrengthWorkoutVariants(
                    strengthWorkout
                  )
                : [];

            const availableStrengthVariants =
              strengthVariants.filter(
                (variant) =>
                  variant.variantType !==
                    "FullGym" &&
                  (
                    variant.variantType !==
                      "Home" ||
                    isStrengthWorkoutVariantAvailable(
                      variant,
                      currentHomeWorkoutEquipment,
                      currentHomeWorkoutCapabilities
                    )
                  )
              );

            const alternativesOpen =
              expandedStrengthActivityId ===
              activity.id;


            return (
              <div
                key={
                  activity.id
                }
                className={
                  completed
                    ? "rounded-xl border border-emerald-200 bg-emerald-50/40 p-4"
                    : "rounded-xl border border-slate-200 p-4"
                }
              >

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <div className="flex flex-wrap items-center gap-2">

                      <p className="font-semibold text-slate-900">
                        {activity.label}
                      </p>


                      {completed && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          Completed
                        </span>
                      )}


                      {activity.optional && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          Optional
                        </span>
                      )}

                    </div>


                    <p className="mt-1 text-sm text-slate-500">
                      {
                        getActivityDescription(
                          activity
                        )
                      }

                      {duration &&
                        ` · ${duration}`}
                    </p>

                  </div>


                  {activity.strengthWorkout && (
                    <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {
                        activity.strengthWorkout
                      }
                    </span>
                  )}


                  {isRun &&
                    activity.cardioIntensity && (
                      <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {
                          activity.cardioIntensity
                        }
                      </span>
                    )}

                </div>


                {activity.note && (
                  <p className="mt-3 text-sm text-slate-600">
                    {activity.note}
                  </p>
                )}


                {/* ==========================================
                    Strength
                ========================================== */}

                {isStrength && (
                  <div className="mt-4">

                    {completed ? (
                      <p className="text-sm font-semibold text-emerald-700">
                        Workout completed
                      </p>
                    ) : (
                      <div>
                        <Link
                          href={{
                            pathname:
                              "/workout",

                            query: {
                              start:
                                activity.strengthWorkout ??
                                activity.label,

                              activityId:
                                activity.id,

                              date:
                                schedule.date,
                            },
                          }}
                          className="inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          Start {
                            activity.strengthWorkout ??
                            activity.label
                          }
                        </Link>

                        {availableStrengthVariants.length >
                          0 && (
                          <div className="mt-3">
                            <button
                              type="button"
                              onClick={
                                () =>
                                  setExpandedStrengthActivityId(
                                    alternativesOpen
                                      ? null
                                      : activity.id
                                  )
                              }
                              aria-expanded={
                                alternativesOpen
                              }
                              className="text-sm font-medium text-slate-600 underline decoration-slate-300 underline-offset-4 transition hover:text-blue-700"
                            >
                              {alternativesOpen
                                ? "Hide other options"
                                : "Need another option?"}
                            </button>

                            {alternativesOpen && (
                              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                {availableStrengthVariants.map(
                                  (variant) => (
                                    <Link
                                      key={
                                        variant.id
                                      }
                                      href={{
                                        pathname:
                                          "/workout",

                                        query: {
                                          start:
                                            activity.strengthWorkout ??
                                            activity.label,

                                          activityId:
                                            activity.id,

                                          date:
                                            schedule.date,

                                          variant:
                                            variant.id,
                                        },
                                      }}
                                      className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-300 hover:bg-blue-50/40"
                                    >
                                      <div className="flex items-center justify-between gap-3">
                                        <p className="font-semibold text-slate-900">
                                          {
                                            getVariantName(
                                              variant
                                            )
                                          }
                                        </p>

                                        <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-slate-500">
                                          {
                                            variant.exercises
                                              .reduce(
                                                (
                                                  total,
                                                  exercise
                                                ) =>
                                                  total +
                                                  exercise.sets,
                                                0
                                              )
                                          }{" "}
                                          sets
                                        </span>
                                      </div>

                                      <p className="mt-1 text-sm text-slate-500">
                                        {
                                          getVariantDescription(
                                            variant
                                          )
                                        }
                                      </p>

                                      {variant.note && (
                                        <p className="mt-2 text-xs leading-5 text-slate-500">
                                          {
                                            variant.note
                                          }
                                        </p>
                                      )}
                                    </Link>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                )}


                {/* ==========================================
                    Run
                ========================================== */}

                {isRun && (
                  <div className="mt-4">

                    {completed ? (
                      <p className="text-sm font-semibold text-emerald-700">
                        Run completed
                      </p>
                    ) : (
                      <Link
                        href={{
                          pathname:
                            "/running",

                          query: {
                            start:
                              "run",

                            activityId:
                              activity.id,

                            date:
                              schedule.date,

                            ...(
                              activity.cardioIntensity
                                ? {
                                    intensity:
                                      activity.cardioIntensity,
                                  }
                                : {}
                            ),
                          },
                        }}
                        className="inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Start Run
                      </Link>
                    )}

                  </div>
                )}


                {/* ==========================================
                    Manual Activity
                ========================================== */}

                {isManualActivity && (
                  <div className="mt-4">

                    {completed ? (
                      <button
                        type="button"
                        onClick={
                          () =>
                            onRemoveActivityCompletion(
                              activity.id
                            )
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                      >
                        <span>
                          ✓
                        </span>

                        Completed
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={
                          () =>
                            onCompleteActivity(
                              activity
                            )
                        }
                        className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Mark Complete
                      </button>
                    )}

                  </div>
                )}

                {!completed && (
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={
                        () =>
                          openReschedule(
                            activity
                          )
                      }
                      className="text-sm font-medium text-slate-600 underline decoration-slate-300 underline-offset-4 transition hover:text-blue-700"
                    >
                      Move to another date
                    </button>
                  </div>
                )}

              </div>
            );
          }
        )}

      </div>

      </section>

      {resetPlanConfirmation}
      {rescheduleConfirmation}
    </>
  );
}