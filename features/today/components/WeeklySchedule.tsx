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
}


// ============================================================
// Date Helpers
// ============================================================

function getMonday(
  date: Date
) {
  const day =
    date.getDay();

  const daysSinceMonday =
    day === 0
      ? 6
      : day - 1;

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() -
      daysSinceMonday
  );
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
    getMonday(
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
  // Render Group
  // ----------------------------------------------------------

  function renderGroup(
    group: ScheduleGroup
  ) {
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

        <div className="mt-1 divide-y divide-slate-200">
          {group.occurrences.map(
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
        </div>
      </div>
    );
  }


  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  return (
    <Card className="rounded-2xl p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
        Training Week Schedule
      </p>

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