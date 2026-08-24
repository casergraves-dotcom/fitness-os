import type {
  TrainingPlanState,
} from "../types";

import {
  evaluateWeeklyScheduleRearrangement,
} from "./evaluateWeeklyScheduleRearrangement";

import type {
  WeeklyScheduleRearrangementEvaluation,
  WeeklyScheduleRearrangementMove,
} from "./evaluateWeeklyScheduleRearrangement";


// ============================================================
// Types
// ============================================================

export interface RearrangementActivityOptions {
  trainingActivityId:
    string;

  originalDate:
    string;

  candidateDates:
    string[];
}


export interface RankWeeklyScheduleRearrangementsInput {
  state:
    TrainingPlanState;

  weekStartDate:
    string;

  activities:
    RearrangementActivityOptions[];

  unavailableDates?:
    string[];

  maxResults?:
    number;
}


// ============================================================
// Helpers
// ============================================================

function getUniqueDates(
  values: string[]
) {
  return Array.from(
    new Set(
      values
    )
  );
}


function buildMove(
  activity:
    RearrangementActivityOptions,
  scheduledDate: string
): WeeklyScheduleRearrangementMove | null {

  // Keeping an occurrence on its original date requires no
  // reschedule overlay and should not count as a move.

  if (
    scheduledDate ===
    activity.originalDate
  ) {
    return null;
  }

  return {
    trainingActivityId:
      activity.trainingActivityId,

    originalDate:
      activity.originalDate,

    scheduledDate,
  };
}


// ============================================================
// Generate Combinations
// ============================================================

function generateMoveSets(
  activities:
    RearrangementActivityOptions[]
): WeeklyScheduleRearrangementMove[][] {

  let combinations:
    WeeklyScheduleRearrangementMove[][] =
      [[]];


  for (
    const activity
    of activities
  ) {
    const candidateDates =
      getUniqueDates([
        activity.originalDate,
        ...activity.candidateDates,
      ]);


    const nextCombinations:
      WeeklyScheduleRearrangementMove[][] =
        [];


    for (
      const existing
      of combinations
    ) {
      for (
        const candidateDate
        of candidateDates
      ) {
        const move =
          buildMove(
            activity,
            candidateDate
          );


        nextCombinations.push(
          move
            ? [
                ...existing,
                move,
              ]
            : [
                ...existing,
              ]
        );
      }
    }


    combinations =
      nextCombinations;
  }


  return combinations;
}


// ============================================================
// Dedupe
// ============================================================

function getMoveSetKey(
  moves:
    WeeklyScheduleRearrangementMove[]
) {
  return moves
    .map(
      (move) =>
        [
          move.trainingActivityId,
          move.originalDate,
          move.scheduledDate,
        ].join(":")
    )
    .sort()
    .join("|");
}


// ============================================================
// Rank Weekly Rearrangements
// ============================================================

export function rankWeeklyScheduleRearrangements({
  state,
  weekStartDate,
  activities,
  unavailableDates = [],
  maxResults = 20,
}: RankWeeklyScheduleRearrangementsInput):
  WeeklyScheduleRearrangementEvaluation[] {

  const moveSets =
    generateMoveSets(
      activities
    );


  const seen =
    new Set<string>();


  const evaluations:
    WeeklyScheduleRearrangementEvaluation[] =
      [];


  for (
    const moves
    of moveSets
  ) {
    const key =
      getMoveSetKey(
        moves
      );


    if (
      seen.has(
        key
      )
    ) {
      continue;
    }

    seen.add(
      key
    );


    const evaluation =
      evaluateWeeklyScheduleRearrangement({
        state,

        weekStartDate,

        moves,

        unavailableDates,
      });


    if (!evaluation) {
      continue;
    }


    evaluations.push(
      evaluation
    );
  }


  evaluations.sort(
    (
      first,
      second
    ) => {
      // Primary ranking is the whole-week score.
      if (
        first.score !==
        second.score
      ) {
        return (
          first.score -
          second.score
        );
      }


      // Prefer fewer actual moves when scores tie.
      if (
        first.moves.length !==
        second.moves.length
      ) {
        return (
          first.moves.length -
          second.moves.length
        );
      }


      // Stable deterministic fallback.
      return getMoveSetKey(
        first.moves
      ).localeCompare(
        getMoveSetKey(
          second.moves
        )
      );
    }
  );


  return evaluations.slice(
    0,
    Math.max(
      1,
      maxResults
    )
  );
}