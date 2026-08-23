import type {
  RunProgressionPrescription,
  RunProgressionRole,
  RunSession,
} from "../types";

import {
  evaluateRunProgression,
} from "./evaluateRunProgression";

import {
  getRunProgressionDecision,
} from "./getRunProgressionDecision";


// ============================================================
// Types
// ============================================================

export type WeeklyRunningProgressionUpdates =
  Partial<
    Record<
      RunProgressionRole,
      RunProgressionPrescription
    >
  >;


// ============================================================
// Date Helpers
// ============================================================

function parseLocalDate(
  dateString: string
): Date | null {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      dateString
    );

  if (!match) {
    return null;
  }

  const year =
    Number(match[1]);

  const month =
    Number(match[2]);

  const day =
    Number(match[3]);

  const date =
    new Date(
      year,
      month - 1,
      day
    );

  if (
    date.getFullYear() !==
      year ||
    date.getMonth() !==
      month - 1 ||
    date.getDate() !==
      day
  ) {
    return null;
  }

  return date;
}


function addDays(
  date: Date,
  days: number
) {
  const result =
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

  result.setDate(
    result.getDate() +
      days
  );

  return result;
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


// ============================================================
// Run Selection
// ============================================================

function getLatestRunForRole(
  runs: RunSession[],
  role: RunProgressionRole
): RunSession | null {
  const matchingRuns =
    runs
      .filter(
        (run) =>
          Boolean(
            run.completedAt
          ) &&
          Boolean(
            run.scheduledActivityId
          ) &&
          Boolean(
            run.scheduledDate
          ) &&
          run
            .prescribedRunProgressionRole ===
            role
      )
      .sort(
        (a, b) => {
          const dateCompare =
            (
              a.scheduledDate ??
              ""
            ).localeCompare(
              b.scheduledDate ??
              ""
            );

          if (
            dateCompare !== 0
          ) {
            return dateCompare;
          }

          return (
            a.completedAt ??
            a.startedAt
          ).localeCompare(
            b.completedAt ??
            b.startedAt
          );
        }
      );

  return (
    matchingRuns.at(-1) ??
    null
  );
}


// ============================================================
// Weekly Running Progression
// ============================================================

export function getWeeklyRunningProgressionUpdates(
  weekStartDate: string,
  runHistory: RunSession[]
): WeeklyRunningProgressionUpdates {
  const weekStart =
    parseLocalDate(
      weekStartDate
    );

  if (!weekStart) {
    return {};
  }

  const weekEndDate =
    formatLocalDate(
      addDays(
        weekStart,
        6
      )
    );


  // Only scheduled runs from the evaluated calendar week are
  // eligible to change the persistent running prescription.
  //
  // Manual runs remain useful history but cannot advance the
  // prescribed running program.
  const weeklyRuns =
    runHistory.filter(
      (run) =>
        Boolean(
          run.completedAt
        ) &&
        Boolean(
          run.scheduledActivityId
        ) &&
        Boolean(
          run.scheduledDate
        ) &&
        run.scheduledDate! >=
          weekStartDate &&
        run.scheduledDate! <=
          weekEndDate
    );


  const updates:
    WeeklyRunningProgressionUpdates =
    {};


  const roles:
    RunProgressionRole[] = [
      "Development",
      "Endurance",
    ];


  for (
    const role
    of roles
  ) {
    const run =
      getLatestRunForRole(
        weeklyRuns,
        role
      );

    if (!run) {
      continue;
    }

    const evaluation =
      evaluateRunProgression(
        run
      );

    const decision =
      getRunProgressionDecision(
        evaluation
      );

    if (
      decision.nextPrescription
    ) {
      updates[role] =
        decision.nextPrescription;
    }
  }


  return updates;
}