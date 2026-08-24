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
}


function ActivityRow({
  occurrence,
  completed,
}: ActivityRowProps) {
  const moved =
    occurrence.date !==
    occurrence.originalDate;

  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className="font-semibold text-slate-900">
            {
              occurrence
                .activity
                .label
            }
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

      <span
        className={
          completed
            ? "shrink-0 text-sm font-medium text-emerald-600"
            : "shrink-0 text-sm text-slate-400"
        }
      >
        {completed
          ? "Completed"
          : "Planned"}
      </span>
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
}: WeeklyScheduleProps) {
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
    </Card>
  );
}