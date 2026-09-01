import {
  useState,
} from "react";

import {
  Card,
} from "@/components/ui/card";

import type {
  TrainingActivityCompletion,
  TrainingPlanState,
} from "@/features/workout/types";

import {
  getResolvedWeeklyActivityOccurrences,
} from "@/features/workout/logic/getResolvedWeeklyActivityOccurrences";

import type {
  ResolvedWeeklyActivityOccurrence,
} from "@/features/workout/logic/getResolvedWeeklyActivityOccurrences";

import {
  evaluateProposedActivityReschedule,
} from "@/features/workout/logic/evaluateProposedActivityReschedule";

import {
  getAdaptiveWeeklyScheduleRecommendation,
} from "@/features/workout/logic/getAdaptiveWeeklyScheduleRecommendation";

import type {
  AdaptiveWeeklyScheduleRecommendation,
} from "@/features/workout/logic/getAdaptiveWeeklyScheduleRecommendation";
import {
  getTrainingWeekStart,
} from "@/lib/date/trainingWeek";


// ============================================================
// Props
// ============================================================

interface WeeklyScheduleProps {
  state:
    TrainingPlanState | null;

  completions:
    TrainingActivityCompletion[];

  loaded:
    boolean;

  currentDate:
    Date;

  onRescheduleActivity: (
    trainingActivityId: string,
    originalDate: string,
    scheduledDate: string
  ) => void;

  onRescheduleActivities: (
    moves: {
      trainingActivityId: string;
      originalDate: string;
      scheduledDate: string;
    }[]
  ) => void;

  onApplyAdaptiveScheduleRecommendation: (
    moves: {
      trainingActivityId: string;
      originalDate: string;
      scheduledDate: string;
    }[],
    adjustments: {
      trainingActivityId: string;
      originalDate: string;
      action: "Skip" | "Substitute";
      substituteTrainingActivityId?: string;
    }[],
    variantOverrides: {
      trainingActivityId: string;
      originalDate: string;
      strengthWorkoutVariantId: string;
    }[]
  ) => void;
}


// ============================================================
// Date Helpers
// ============================================================

function getCanonicalWeekStart(
  date: Date
) {
  return getTrainingWeekStart(date);
}


function addCalendarDays(
  date: Date,
  days: number
) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + days
  );
}


function formatLocalDate(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function formatDisplayDate(
  value: string
) {
  const date =
    new Date(
      `${value}T12:00:00`
    );

  return date.toLocaleDateString(
    undefined,
    {
      weekday:
        "short",

      month:
        "short",

      day:
        "numeric",
    }
  );
}


// ============================================================
// Grouping
// ============================================================

interface ScheduleGroup {
  date: string;

  occurrences:
    ResolvedWeeklyActivityOccurrence[];
}


function groupOccurrencesByDate(
  occurrences:
    ResolvedWeeklyActivityOccurrence[]
): ScheduleGroup[] {
  const groups =
    new Map<
      string,
      ResolvedWeeklyActivityOccurrence[]
    >();

  for (
    const occurrence
    of occurrences
  ) {
    const existing =
      groups.get(
        occurrence.date
      );

    if (existing) {
      existing.push(
        occurrence
      );

      continue;
    }

    groups.set(
      occurrence.date,
      [occurrence]
    );
  }

  return Array.from(
    groups.entries()
  )
    .sort(
      ([dateA], [dateB]) =>
        dateA.localeCompare(
          dateB
        )
    )
    .map(
      ([date, items]) => ({
        date,
        occurrences:
          items,
      })
    );
}


// ============================================================
// Activity Row
// ============================================================

interface ActivityRowProps {
  occurrence:
    ResolvedWeeklyActivityOccurrence;

  completed:
    boolean;

  onMove: (
    occurrence:
      ResolvedWeeklyActivityOccurrence
  ) => void;
}


function ActivityRow({
  occurrence,
  completed,
  onMove,
}: ActivityRowProps) {
  const moved =
    occurrence.date !==
    occurrence.originalDate;

  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className="font-semibold text-slate-900">
            {occurrence.activity.label}
          </p>

          {occurrence.activity.optional && (
            <span className="text-xs text-slate-500">
              Optional
            </span>
          )}
        </div>

        {moved && (
          <p className="mt-1 text-xs text-blue-600">
            Moved from{" "}
            {formatDisplayDate(
              occurrence.originalDate
            )}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <span
          className={
            completed
              ? "text-sm font-medium text-emerald-600"
              : "text-sm text-slate-400"
          }
        >
          {completed
            ? "Completed"
            : "Planned"}
        </span>

        {!completed && (
          <button
            type="button"
            onClick={() =>
              onMove(
                occurrence
              )
            }
            className="text-sm font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
          >
            Move
          </button>
        )}
      </div>
    </div>
  );
}


// ============================================================
// Weekly Schedule
// ============================================================

export default function WeeklySchedule({
  state,
  completions,
  loaded,
  currentDate,
  onRescheduleActivity,
  onRescheduleActivities,
  onApplyAdaptiveScheduleRecommendation,
}: WeeklyScheduleProps) {
  const [
    movingOccurrence,
    setMovingOccurrence,
  ] =
    useState<
      ResolvedWeeklyActivityOccurrence | null
    >(null);

  const [
    moveDate,
    setMoveDate,
  ] =
    useState("");

  const [
    adjustingWeek,
    setAdjustingWeek,
  ] =
    useState(false);

  const [
    unavailableDates,
    setUnavailableDates,
  ] =
    useState<string[]>(
      []
    );

  const [
    recommendation,
    setRecommendation,
  ] =
    useState<
      AdaptiveWeeklyScheduleRecommendation | null
    >(null);
  // ----------------------------------------------------------
  // Loading
  // ----------------------------------------------------------

  if (!loaded) {
    return (
      <Card className="rounded-2xl p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
          Training Week Schedule
        </p>

        <p className="mt-5 text-sm text-slate-500">
          Loading weekly schedule...
        </p>
      </Card>
    );
  }


  // ----------------------------------------------------------
  // No Active Plan
  // ----------------------------------------------------------

  if (!state) {
    return null;
  }


  // ----------------------------------------------------------
  // Resolve Week
  // ----------------------------------------------------------

  const weekStart =
    getCanonicalWeekStart(
      currentDate
    );

  const weekEnd =
    addCalendarDays(
      weekStart,
      6
    );

  const weekStartDate =
    formatLocalDate(
      weekStart
    );

  const weekEndDate =
    formatLocalDate(
      weekEnd
    );

  const occurrences =
    getResolvedWeeklyActivityOccurrences(
      state,
      weekStartDate
    );

  if (!occurrences) {
    return null;
  }


  // ----------------------------------------------------------
  // Separate Normal Week From Cross-Week Moves
  // ----------------------------------------------------------

  const inWeekOccurrences =
    occurrences.filter(
      (occurrence) =>
        occurrence.date >=
          weekStartDate &&
        occurrence.date <=
          weekEndDate
    );

  const outsideWeekOccurrences =
    occurrences.filter(
      (occurrence) =>
        occurrence.date <
          weekStartDate ||
        occurrence.date >
          weekEndDate
    );


  const inWeekGroups =
    groupOccurrencesByDate(
      inWeekOccurrences
    );

  const outsideWeekGroups =
    groupOccurrencesByDate(
      outsideWeekOccurrences
    );


  // ----------------------------------------------------------
  // Completion Lookup
  // ----------------------------------------------------------

  function isCompleted(
    occurrence:
      ResolvedWeeklyActivityOccurrence
  ) {
    return completions.some(
      (completion) =>
        completion.trainingActivityId ===
          occurrence.activity.id &&
        completion.date ===
          occurrence.date
    );
  }


    // ----------------------------------------------------------
  // Activity Rescheduling
  // ----------------------------------------------------------

  function openMoveDialog(
    occurrence:
      ResolvedWeeklyActivityOccurrence
  ) {
    setMovingOccurrence(
      occurrence
    );

    setMoveDate(
      occurrence.date
    );
  }


  function closeMoveDialog() {
    setMovingOccurrence(
      null
    );

    setMoveDate("");
  }


  function confirmMove() {
    if (
      !movingOccurrence ||
      !moveDate
    ) {
      return;
    }

    onRescheduleActivity(
      movingOccurrence.activity.id,
      movingOccurrence.originalDate,
      moveDate
    );

    closeMoveDialog();
  }


  const moveDateChanged =
    movingOccurrence !== null &&
    moveDate !== "" &&
    moveDate !== movingOccurrence.date;


  const proposedMoveEvaluation =
    movingOccurrence &&
    moveDateChanged
      ? evaluateProposedActivityReschedule({
          state,

          trainingActivityId:
            movingOccurrence.activity.id,

          originalDate:
            movingOccurrence.originalDate,

          scheduledDate:
            moveDate,
        })
      : null;


  const proposedMoveConflicts =
    proposedMoveEvaluation
      ?.conflicts ??
    [];


  const hasHighMoveConflict =
    proposedMoveEvaluation
      ?.hasHighConflict ??
    false;


  // ----------------------------------------------------------
  // Adaptive Weekly Recommendation
  // ----------------------------------------------------------

  const weekDates =
    Array.from(
      {
        length:
          7,
      },
      (
        _,
        index
      ) =>
        formatLocalDate(
          addCalendarDays(
            weekStart,
            index
          )
        )
    );


  function toggleUnavailableDate(
    date: string
  ) {
    setUnavailableDates(
      (current) =>
        current.includes(
          date
        )
          ? current.filter(
              (value) =>
                value !==
                date
            )
          : [
              ...current,
              date,
            ].sort()
    );

    setRecommendation(
      null
    );
  }


  function closeWeekAdjustment() {
    setAdjustingWeek(
      false
    );

    setUnavailableDates(
      []
    );

    setRecommendation(
      null
    );
  }


  function findRecommendation() {
    if (
      unavailableDates.length ===
        0 ||
      !state
    ) {
      return;
    }

    setRecommendation(
      getAdaptiveWeeklyScheduleRecommendation({
        state,
        weekStartDate,
        unavailableDates,
      })
    );
  }


  function applyRecommendation() {
    if (!recommendation) {
      return;
    }


    const adjustments =
      recommendation
        .optionalAdjustments
        .flatMap(
          (adjustment) => {
            if (
              adjustment.action ===
                "Substitute" &&
              !adjustment.replacementActivity
            ) {
              return [];
            }


            return adjustment
              .conflictingActivities
              .map(
                (activity) => ({
                  trainingActivityId:
                    activity.trainingActivityId,

                  originalDate:
                    adjustment.scheduledDate,

                  action:
                    adjustment.action,

                  substituteTrainingActivityId:
                    adjustment.action ===
                      "Substitute"
                      ? adjustment
                          .replacementActivity
                          ?.trainingActivityId
                      : undefined,
                })
              );
          }
        );


    onApplyAdaptiveScheduleRecommendation(
      recommendation.moves.map(
        (move) => ({
          trainingActivityId:
            move.trainingActivityId,

          originalDate:
            move.originalDate,

          scheduledDate:
            move.scheduledDate,
        })
      ),

      adjustments,

      recommendation.variantRecommendations.map(
        (variantRecommendation) => ({
          trainingActivityId:
            variantRecommendation.trainingActivityId,

          originalDate:
            variantRecommendation.originalDate,

          strengthWorkoutVariantId:
            variantRecommendation.variantId,
        })
      )
    );


    closeWeekAdjustment();
  }


  // ----------------------------------------------------------
  // Render Group
  // ----------------------------------------------------------

  function renderGroup(
    group: ScheduleGroup
  ) {
    const isRestDay =
      group.occurrences.some(
        (occurrence) =>
          occurrence.activity.type ===
          "Rest"
      );

    const presentedOccurrences =
      group.occurrences.filter(
        (occurrence) =>
          occurrence.activity.type !==
          "Rest"
      );

    return (
      <div
        key={
          group.date
        }
        className="rounded-xl bg-slate-50 px-4 py-3"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {formatDisplayDate(
            group.date
          )}
        </p>

        {isRestDay && (
          <p className="mt-2 font-semibold text-slate-900">
            Rest Day
          </p>
        )}

        <div className={isRestDay ? "mt-2 divide-y divide-slate-200" : "mt-1 divide-y divide-slate-200"}>
          {presentedOccurrences.map(
            (
              occurrence,
              index
            ) => (
              <ActivityRow
                key={
                  `${occurrence.activity.id}-${occurrence.originalDate}-${index}`
                }
                occurrence={
                  occurrence
                }
                completed={
                  isCompleted(
                    occurrence
                  )
                }
                onMove={
                    openMoveDialog
                }
              />
            )
          )}

          {isRestDay &&
            presentedOccurrences.length ===
              0 && (
            <p className="py-2 text-sm text-slate-500">
              No training scheduled
            </p>
          )}
        </div>
      </div>
    );
  }


  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  return (
    <Card className="rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
          Training Week Schedule
        </p>

        <button
          type="button"
          onClick={() => {
            setAdjustingWeek(
              true
            );

            setRecommendation(
              null
            );
          }}
          className="text-sm font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
        >
          Adjust week
        </button>
      </div>

      {inWeekGroups.length > 0 ? (
        <div className="mt-5 space-y-3">
          {inWeekGroups.map(
            renderGroup
          )}
        </div>
      ) : (
        <p className="mt-5 text-sm text-slate-500">
          No training activities scheduled for this week.
        </p>
      )}

      {outsideWeekGroups.length > 0 && (
        <div className="mt-6 border-t border-slate-200 pt-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Moved Outside Training Week
          </p>

          <div className="mt-3 space-y-3">
            {outsideWeekGroups.map(
              renderGroup
            )}
          </div>
        </div>
      )}

      {adjustingWeek && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-950/40 px-4 pt-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:items-center sm:py-6">
          <div className="max-h-[calc(100dvh-8rem-env(safe-area-inset-bottom))] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:max-h-[90vh]">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Adjust Training Week
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              Which days are unavailable?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Select the days when you cannot train. Fitness OS
              will look for a safer way to rearrange the current
              week without changing anything until you approve it.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {weekDates.map(
                (date) => {
                  const selected =
                    unavailableDates.includes(
                      date
                    );

                  return (
                    <button
                      key={
                        date
                      }
                      type="button"
                      onClick={() =>
                        toggleUnavailableDate(
                          date
                        )
                      }
                      className={
                        selected
                          ? "rounded-xl border border-blue-600 bg-blue-50 px-3 py-3 text-left text-blue-800"
                          : "rounded-xl border border-slate-200 px-3 py-3 text-left text-slate-700 hover:bg-slate-50"
                      }
                    >
                      <span className="block text-xs font-semibold uppercase tracking-wider">
                        {new Date(
                          `${date}T12:00:00`
                        ).toLocaleDateString(
                          undefined,
                          {
                            weekday:
                              "short",
                          }
                        )}
                      </span>

                      <span className="mt-1 block text-xs">
                        {new Date(
                          `${date}T12:00:00`
                        ).toLocaleDateString(
                          undefined,
                          {
                            month:
                              "short",

                            day:
                              "numeric",
                          }
                        )}
                      </span>
                    </button>
                  );
                }
              )}
            </div>

            {!recommendation && (
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={
                    closeWeekAdjustment
                  }
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    unavailableDates.length ===
                    0
                  }
                  onClick={
                    findRecommendation
                  }
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Find a Better Schedule
                </button>
              </div>
            )}

            {recommendation && (
              <div className="mt-6 border-t border-slate-200 pt-6">
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                    Suggested Week
                  </p>

                  <p className="mt-2 font-semibold text-slate-900">
                    {recommendation.summary}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {recommendation.explanation}
                  </p>
                </div>

                <div className="mt-5">
                  <p className="text-sm font-semibold text-slate-900">
                    Proposed moves
                  </p>

                  <div className="mt-2 divide-y divide-slate-200 rounded-xl border border-slate-200 px-4">
                    {recommendation.moves.map(
                      (move) => (
                        <div
                          key={`${move.trainingActivityId}-${move.originalDate}`}
                          className="flex items-center justify-between gap-4 py-3"
                        >
                          <span className="text-sm font-medium text-slate-900">
                            {move.label}
                          </span>

                          <span className="text-sm text-slate-600">
                            {move.originalDayLabel}
                            {" → "}
                            {move.scheduledDayLabel}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {recommendation.optionalAdjustments.length >
                  0 && (
                  <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-semibold text-amber-900">
                      Optional session recommendations
                    </p>

                    <div className="mt-3 space-y-3">
                      {recommendation.optionalAdjustments.map(
                        (
                          adjustment
                        ) => {
                          const conflictingLabel =
                            adjustment
                              .conflictingActivities
                              .map(
                                (
                                  activity
                                ) =>
                                  activity.label
                              )
                              .join(
                                " / "
                              );

                          return (
                            <div
                              key={`${adjustment.scheduledDate}-${adjustment.substitutionGroup ?? "optional"}-${adjustment.action}`}
                              className="rounded-lg border border-amber-200 bg-white/60 p-3"
                            >
                              <p className="text-sm font-semibold text-amber-900">
                                {adjustment.scheduledDayLabel}
                                {" — "}
                                {adjustment.action ===
                                "Substitute"
                                  ? "Substitute"
                                  : "Skip"}
                              </p>

                              <p className="mt-1 text-sm leading-5 text-amber-800">
                                {adjustment.action ===
                                  "Substitute" &&
                                adjustment.replacementActivity
                                  ? (
                                    <>
                                      Replace{" "}
                                      <span className="font-medium">
                                        {conflictingLabel}
                                      </span>
                                      {" with "}
                                      <span className="font-medium">
                                        {
                                          adjustment
                                            .replacementActivity
                                            .label
                                        }
                                      </span>
                                      .
                                    </>
                                  )
                                  : (
                                    <>
                                      Skip{" "}
                                      <span className="font-medium">
                                        {conflictingLabel}
                                      </span>
                                      {" for this week."}
                                    </>
                                  )}
                              </p>

                              <p className="mt-2 text-xs leading-5 text-amber-700">
                                {adjustment.reason}
                              </p>
                            </div>
                          );
                        }
                      )}
                    </div>

                    <p className="mt-3 text-xs leading-5 text-amber-700">
                      Applying this recommendation will apply both
                      the proposed moves and these optional session
                      adjustments together.
                    </p>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={
                      closeWeekAdjustment
                    }
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Keep Current Schedule
                  </button>

                  <button
                    type="button"
                    onClick={
                      applyRecommendation
                    }
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Apply Recommendation
                  </button>
                </div>
              </div>
            )}

            {unavailableDates.length >
              0 &&
              recommendation ===
                null && (
                <p className="mt-4 text-xs text-slate-500">
                  Nothing will change until you apply a
                  recommendation.
                </p>
              )}
          </div>
        </div>
      )}

    {movingOccurrence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Move Activity
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              Move{" "}
              {
                movingOccurrence
                  .activity
                  .label
              }
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Choose another date for this scheduled
              activity. Its training prescription and
              activity identity will be preserved.
            </p>

            <label className="mt-5 block">
              <span className="text-sm font-medium text-slate-700">
                New date
              </span>

              <input
                type="date"
                value={
                  moveDate
                }
                onChange={(event) =>
                  setMoveDate(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500"
              />
            </label>

            {moveDate &&
              proposedMoveEvaluation && (
                <div className="mt-4">
                  {proposedMoveConflicts.length >
                  0 ? (
                    <div
                      className={
                        hasHighMoveConflict
                          ? "rounded-xl border border-red-200 bg-red-50 p-4"
                          : "rounded-xl border border-amber-200 bg-amber-50 p-4"
                      }
                    >
                      <p
                        className={
                          hasHighMoveConflict
                            ? "text-sm font-semibold text-red-800"
                            : "text-sm font-semibold text-amber-800"
                        }
                      >
                        {hasHighMoveConflict
                          ? "High scheduling conflict"
                          : "Scheduling caution"}
                      </p>

                      <div className="mt-2 space-y-2">
                        {proposedMoveConflicts.map(
                          (
                            conflict,
                            index
                          ) => (
                            <p
                              key={`${conflict.kind}-${index}`}
                              className={
                                conflict.severity ===
                                "High"
                                  ? "text-sm leading-5 text-red-700"
                                  : "text-sm leading-5 text-amber-700"
                              }
                            >
                              {conflict.reason}
                            </p>
                          )
                        )}
                      </div>

                      <p
                        className={
                          hasHighMoveConflict
                            ? "mt-3 text-xs leading-5 text-red-700"
                            : "mt-3 text-xs leading-5 text-amber-700"
                        }
                      >
                        You can still move the activity if
                        this schedule works best for you.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-sm font-semibold text-emerald-800">
                        No scheduling conflicts detected
                      </p>

                      <p className="mt-1 text-xs leading-5 text-emerald-700">
                        This move does not create any
                        conflicts detected by the current
                        training-load rules.
                      </p>
                    </div>
                  )}
                </div>
              )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={
                  closeMoveDialog
                }
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  !moveDate ||
                  !moveDateChanged
                }
                onClick={
                  confirmMove
                }
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {hasHighMoveConflict
                  ? "Move Anyway"
                  : "Move Activity"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
