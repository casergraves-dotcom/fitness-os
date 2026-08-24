import type {
  TrainingPlanState,
} from "../types";

import {
  evaluateProposedActivityReschedule,
} from "./evaluateProposedActivityReschedule";

import type {
  ScheduleConflict,
  ScheduleConflictSeverity,
} from "./evaluateScheduleConflicts";


// ============================================================
// Types
// ============================================================

export type RescheduleCandidateStatus =
  | "Recommended"
  | "Acceptable"
  | "Caution"
  | "Avoid";


export interface RescheduleCandidateEvaluation {
  date: string;

  status:
    RescheduleCandidateStatus;

  score:
    number;

  conflicts:
    ScheduleConflict[];

  hasHighConflict:
    boolean;

  hasAnyConflict:
    boolean;

  distanceFromOriginalDays:
    number;

  reason:
    string;
}


export interface RankActivityRescheduleCandidatesInput {
  state:
    TrainingPlanState;

  trainingActivityId:
    string;

  originalDate:
    string;

  candidateDates:
    string[];

  // Dates known to be unavailable should never be recommended.
  unavailableDates?:
    string[];
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
) {
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
// Conflict Scoring
// ============================================================

function getSeverityPenalty(
  severity:
    ScheduleConflictSeverity
) {
  switch (severity) {
    case "High":
      return 100;

    case "Caution":
      return 25;

    case "Info":
      return 5;
  }
}


function getConflictPenalty(
  conflicts:
    ScheduleConflict[]
) {
  return conflicts.reduce(
    (
      total,
      conflict
    ) =>
      total +
      getSeverityPenalty(
        conflict.severity
      ),
    0
  );
}


// ============================================================
// Status / Explanation
// ============================================================

function getCandidateStatus(
  unavailable:
    boolean,
  conflicts:
    ScheduleConflict[],
  distance:
    number
): RescheduleCandidateStatus {
  if (unavailable) {
    return "Avoid";
  }

  if (
    conflicts.some(
      (conflict) =>
        conflict.severity ===
        "High"
    )
  ) {
    return "Avoid";
  }

  if (
    conflicts.length >
    0
  ) {
    return "Caution";
  }

  if (
    distance <= 2
  ) {
    return "Recommended";
  }

  return "Acceptable";
}


function getCandidateReason(
  status:
    RescheduleCandidateStatus,
  unavailable:
    boolean,
  conflicts:
    ScheduleConflict[],
  distance:
    number
) {
  if (unavailable) {
    return "This date is unavailable and should not be selected.";
  }

  if (
    conflicts.some(
      (conflict) =>
        conflict.severity ===
        "High"
    )
  ) {
    return "This date creates a high training-load conflict and should be avoided when a better option is available.";
  }

  if (
    conflicts.length >
    0
  ) {
    return "This date is workable but creates a training-load caution.";
  }

  if (
    distance <= 2
  ) {
    return "This date keeps the activity close to its original place in the week without introducing a scheduling conflict.";
  }

  return "This date does not introduce a scheduling conflict, but it moves the activity farther from its original place in the week.";
}


// ============================================================
// Rank Candidates
// ============================================================

export function rankActivityRescheduleCandidates({
  state,
  trainingActivityId,
  originalDate,
  candidateDates,
  unavailableDates = [],
}: RankActivityRescheduleCandidatesInput):
  RescheduleCandidateEvaluation[] {

  const unavailableSet =
    new Set(
      unavailableDates
    );


  const evaluations =
    candidateDates.flatMap(
      (candidateDate) => {
        const distance =
          getDayDistance(
            originalDate,
            candidateDate
          );

        if (
          distance ===
          null
        ) {
          return [];
        }


        const proposed =
          evaluateProposedActivityReschedule({
            state,

            trainingActivityId,

            originalDate,

            scheduledDate:
              candidateDate,
          });


        if (!proposed) {
          return [];
        }


        const unavailable =
          unavailableSet.has(
            candidateDate
          );


        const conflictPenalty =
          getConflictPenalty(
            proposed.conflicts
          );


        // Lower scores are better.
        //
        // Conflict severity dominates the ranking.
        // Distance acts only as a tie-break / preference for
        // preserving the original weekly rhythm.

        const score =
          (
            unavailable
              ? 1000
              : 0
          ) +
          conflictPenalty +
          distance;


        const status =
          getCandidateStatus(
            unavailable,
            proposed.conflicts,
            distance
          );


        return [{
          date:
            candidateDate,

          status,

          score,

          conflicts:
            proposed.conflicts,

          hasHighConflict:
            proposed.hasHighConflict,

          hasAnyConflict:
            proposed.hasAnyConflict,

          distanceFromOriginalDays:
            distance,

          reason:
            getCandidateReason(
              status,
              unavailable,
              proposed.conflicts,
              distance
            ),
        }];
      }
    );


  return evaluations.sort(
    (a, b) => {
      if (
        a.score !==
        b.score
      ) {
        return (
          a.score -
          b.score
        );
      }

      return a.date.localeCompare(
        b.date
      );
    }
  );
}