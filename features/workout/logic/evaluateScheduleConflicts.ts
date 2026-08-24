import type {
  TrainingActivity,
} from "../types";

import {
  classifyScheduleActivityLoad,
} from "./classifyScheduleActivityLoad";


// ============================================================
// Types
// ============================================================

export type ScheduleConflictSeverity =
  | "Info"
  | "Caution"
  | "High";


export type ScheduleConflictKind =
  | "SameDayHardStack"
  | "ConsecutiveStrength"
  | "StrengthAerialAdjacency"
  | "StrengthHardRunAdjacency";


export interface ScheduledActivityOccurrence {
  date: string;

  activity:
    TrainingActivity;
}


export interface ScheduleConflict {
  kind:
    ScheduleConflictKind;

  severity:
    ScheduleConflictSeverity;

  first:
    ScheduledActivityOccurrence;

  second:
    ScheduledActivityOccurrence;

  reason:
    string;
}


export interface ScheduleConflictEvaluation {
  conflicts:
    ScheduleConflict[];

  hasHighConflict:
    boolean;

  hasAnyConflict:
    boolean;
}


// ============================================================
// Date Helpers
// ============================================================

function parseLocalDate(
  value: string
): Date | null {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      value
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


function getDayDistance(
  firstDate: string,
  secondDate: string
): number | null {
  const first =
    parseLocalDate(
      firstDate
    );

  const second =
    parseLocalDate(
      secondDate
    );

  if (
    !first ||
    !second
  ) {
    return null;
  }

  const firstUtc =
    Date.UTC(
      first.getFullYear(),
      first.getMonth(),
      first.getDate()
    );

  const secondUtc =
    Date.UTC(
      second.getFullYear(),
      second.getMonth(),
      second.getDate()
    );

  return Math.abs(
    Math.round(
      (
        secondUtc -
        firstUtc
      ) /
        86_400_000
    )
  );
}


// ============================================================
// Relationship Helpers
// ============================================================

function isFullStrength(
  occurrence:
    ScheduledActivityOccurrence
) {
  return (
    occurrence.activity.type ===
      "Strength" &&
    classifyScheduleActivityLoad(
      occurrence.activity
    ).strength ===
      "Hard"
  );
}


function isAerial(
  occurrence:
    ScheduledActivityOccurrence
) {
  return (
    occurrence.activity.type ===
    "Aerial"
  );
}


function isHardRun(
  occurrence:
    ScheduledActivityOccurrence
) {
  if (
    occurrence.activity.type !==
    "Run"
  ) {
    return false;
  }

  const load =
    classifyScheduleActivityLoad(
      occurrence.activity
    );

  return (
    load.lowerBody ===
      "Hard" ||
    load.aerobic ===
      "Hard"
  );
}


// ============================================================
// Conflict Rules
// ============================================================

function evaluatePair(
  first:
    ScheduledActivityOccurrence,
  second:
    ScheduledActivityOccurrence
): ScheduleConflict[] {
  const distance =
    getDayDistance(
      first.date,
      second.date
    );

  if (
    distance ===
    null
  ) {
    return [];
  }

  const firstLoad =
    classifyScheduleActivityLoad(
      first.activity
    );

  const secondLoad =
    classifyScheduleActivityLoad(
      second.activity
    );

  const conflicts:
    ScheduleConflict[] = [];


  // ----------------------------------------------------------
  // Same-Day Hard Stack
  // ----------------------------------------------------------

  if (
    distance === 0 &&
    firstLoad.overall ===
      "Hard" &&
    secondLoad.overall ===
      "Hard"
  ) {
    conflicts.push({
      kind:
        "SameDayHardStack",

      severity:
        "High",

      first,

      second,

      reason:
        `${first.activity.label} and ${second.activity.label} are both hard sessions scheduled on the same day.`,
    });
  }


  // ----------------------------------------------------------
  // Consecutive Full-Body Strength
  // ----------------------------------------------------------

  if (
    distance === 1 &&
    isFullStrength(
      first
    ) &&
    isFullStrength(
      second
    )
  ) {
    conflicts.push({
      kind:
        "ConsecutiveStrength",

      severity:
        "High",

      first,

      second,

      reason:
        "Full-body strength sessions are scheduled on consecutive days, reducing recovery between sessions.",
    });
  }


  // ----------------------------------------------------------
  // Strength + Aerial Adjacency
  // ----------------------------------------------------------

  if (
    distance === 1 &&
    (
      (
        isFullStrength(
          first
        ) &&
        isAerial(
          second
        )
      ) ||
      (
        isAerial(
          first
        ) &&
        isFullStrength(
          second
        )
      )
    )
  ) {
    conflicts.push({
      kind:
        "StrengthAerialAdjacency",

      severity:
        "Caution",

      first,

      second,

      reason:
        "Aerial and full-body strength are scheduled on adjacent days, which may stack upper-body and pulling fatigue.",
    });
  }


  // ----------------------------------------------------------
  // Strength + Hard Running Adjacency
  // ----------------------------------------------------------

  if (
    distance === 1 &&
    (
      (
        isFullStrength(
          first
        ) &&
        isHardRun(
          second
        )
      ) ||
      (
        isHardRun(
          first
        ) &&
        isFullStrength(
          second
        )
      )
    )
  ) {
    conflicts.push({
      kind:
        "StrengthHardRunAdjacency",

      severity:
        "Caution",

      first,

      second,

      reason:
        "Hard running and full-body strength are scheduled on adjacent days, which may stack lower-body fatigue.",
    });
  }


  return conflicts;
}


// ============================================================
// Evaluate Schedule Conflicts
// ============================================================

export function evaluateScheduleConflicts(
  occurrences:
    ScheduledActivityOccurrence[]
): ScheduleConflictEvaluation {
  const conflicts:
    ScheduleConflict[] =
      [];


  for (
    let firstIndex = 0;
    firstIndex <
      occurrences.length;
    firstIndex += 1
  ) {
    for (
      let secondIndex =
        firstIndex + 1;
      secondIndex <
        occurrences.length;
      secondIndex += 1
    ) {
      conflicts.push(
        ...evaluatePair(
          occurrences[
            firstIndex
          ],
          occurrences[
            secondIndex
          ]
        )
      );
    }
  }


  return {
    conflicts,

    hasHighConflict:
      conflicts.some(
        (conflict) =>
          conflict.severity ===
          "High"
      ),

    hasAnyConflict:
      conflicts.length >
      0,
  };
}