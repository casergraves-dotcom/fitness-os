import type {
  TrainingPlanState,
} from "../types";

import type {
  RearrangementActivityOptions,
} from "./rankWeeklyScheduleRearrangements";

import {
  evaluateWeeklyScheduleRearrangement,
} from "./evaluateWeeklyScheduleRearrangement";

import {
  getResolvedWeeklyActivityOccurrences,
} from "./getResolvedWeeklyActivityOccurrences";

import type {
  WeeklyScheduleRearrangementEvaluation,
  WeeklyScheduleRearrangementMove,
} from "./evaluateWeeklyScheduleRearrangement";


// ============================================================
// Types
// ============================================================

export interface SearchAdaptiveWeeklyRearrangementsInput {
  state:
    TrainingPlanState;

  weekStartDate:
    string;

  activities:
    RearrangementActivityOptions[];

  unavailableDates?:
    string[];

  // Maximum number of partial schedules retained after each
  // activity is considered.
  beamWidth?:
    number;

  // Absolute safety cap on evaluator calls.
  maxEvaluations?:
    number;

  // Maximum number of final ranked schedules returned.
  maxResults?:
    number;
}


interface SearchNode {
  moves:
    WeeklyScheduleRearrangementMove[];

  evaluation:
    WeeklyScheduleRearrangementEvaluation;

  // Used only for pruning partial beam-search states.
  // Final results always retain the evaluator's real score/status.
  searchScore:
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


function getCandidateDates(
  activity:
    RearrangementActivityOptions,
  unavailableSet:
    Set<string>
) {
  // If the original date is unavailable, staying there is not a
  // valid choice.
  //
  // Otherwise preserving the original date should remain an
  // option so supporting activities are not moved unnecessarily.

  const values =
    unavailableSet.has(
      activity.originalDate
    )
      ? activity.candidateDates
      : [
          activity.originalDate,
          ...activity.candidateDates,
        ];


  return getUniqueDates(
    values
  ).filter(
    (date) =>
      !unavailableSet.has(
        date
      )
  );
}


function addActivityChoice(
  existingMoves:
    WeeklyScheduleRearrangementMove[],
  activity:
    RearrangementActivityOptions,
  scheduledDate:
    string
) {
  // Remove any previous choice for this occurrence.
  //
  // This makes the helper safe if the same occurrence somehow
  // appears more than once in a generated search space.

  const withoutOccurrence =
    existingMoves.filter(
      (move) =>
        !(
          move.trainingActivityId ===
            activity.trainingActivityId &&
          move.originalDate ===
            activity.originalDate
        )
    );


  // Staying on the original date requires no reschedule overlay.

  if (
    scheduledDate ===
    activity.originalDate
  ) {
    return withoutOccurrence;
  }


  return [
    ...withoutOccurrence,

    {
      trainingActivityId:
        activity.trainingActivityId,

      originalDate:
        activity.originalDate,

      scheduledDate,
    },
  ];
}


// ============================================================
// Ranking
// ============================================================

function getStatusRank(
  evaluation:
    WeeklyScheduleRearrangementEvaluation
) {
  switch (
    evaluation.status
  ) {
    case "Recommended":
      return 0;

    case "Acceptable":
      return 1;

    case "Caution":
      return 2;

    case "Avoid":
      return 3;
  }
}


function compareEvaluations(
  first:
    WeeklyScheduleRearrangementEvaluation,
  second:
    WeeklyScheduleRearrangementEvaluation
) {
  // ----------------------------------------------------------
  // Primary: Whole-Week Score
  // ----------------------------------------------------------
  //
  // The evaluator's score already makes unavailable-day
  // violations and high conflicts dominate smaller preferences.

  if (
    first.score !==
    second.score
  ) {
    return (
      first.score -
      second.score
    );
  }


  // ----------------------------------------------------------
  // Secondary: Status
  // ----------------------------------------------------------

  const statusDifference =
    getStatusRank(
      first
    ) -
    getStatusRank(
      second
    );

  if (
    statusDifference !==
    0
  ) {
    return statusDifference;
  }


  // ----------------------------------------------------------
  // Tertiary: Fewer Changes
  // ----------------------------------------------------------

  if (
    first.moves.length !==
    second.moves.length
  ) {
    return (
      first.moves.length -
      second.moves.length
    );
  }


  return getMoveSetKey(
    first.moves
  ).localeCompare(
    getMoveSetKey(
      second.moves
    )
  );
}


// ============================================================
// Partial-State Search Scoring
// ============================================================
//
// A partial rearrangement may temporarily conflict with an
// activity that has not been processed yet. Discount those
// temporary conflicts during beam pruning so coordinated moves
// survive long enough to be evaluated.
//
// Final schedule scoring is never changed.

function conflictTouchesRemainingActivity(
  conflict:
    WeeklyScheduleRearrangementEvaluation["conflicts"][number],
  remainingActivityIds:
    Set<string>
) {
  return (
    remainingActivityIds.has(
      conflict.first.activity.id
    ) ||
    remainingActivityIds.has(
      conflict.second.activity.id
    )
  );
}


function getPartialSearchScore(
  evaluation:
    WeeklyScheduleRearrangementEvaluation,
  remainingActivities:
    RearrangementActivityOptions[]
) {
  if (
    remainingActivities.length ===
    0
  ) {
    return evaluation.score;
  }


  const remainingActivityIds =
    new Set(
      remainingActivities.map(
        (activity) =>
          activity.trainingActivityId
      )
    );


  const temporaryConflicts =
    evaluation.conflicts.filter(
      (conflict) =>
        conflictTouchesRemainingActivity(
          conflict,
          remainingActivityIds
        )
    );


  const discount =
    temporaryConflicts.reduce(
      (
        total,
        conflict
      ) => {
        switch (
          conflict.severity
        ) {
          case "High":
            return total + 95;

          case "Caution":
            return total + 20;

          case "Info":
            return total + 5;
        }
      },
      0
    );


  return Math.max(
    0,
    evaluation.score -
      discount
  );
}


function compareSearchNodes(
  first:
    SearchNode,
  second:
    SearchNode
) {
  if (
    first.searchScore !==
    second.searchScore
  ) {
    return (
      first.searchScore -
      second.searchScore
    );
  }


  return compareEvaluations(
    first.evaluation,
    second.evaluation
  );
}


// ============================================================
// Activity Ordering
// ============================================================

function getStrengthOccurrenceKeys(
  state:
    TrainingPlanState,
  weekStartDate:
    string
) {
  const occurrences =
    getResolvedWeeklyActivityOccurrences(
      state,
      weekStartDate
    );

  if (!occurrences) {
    return new Set<string>();
  }

  return new Set(
    occurrences
      .filter(
        (occurrence) =>
          occurrence.activity.type ===
          "Strength"
      )
      .map(
        (occurrence) =>
          [
            occurrence.activity.id,
            occurrence.originalDate,
          ].join("|")
      )
  );
}


function orderActivities(
  activities:
    RearrangementActivityOptions[],
  unavailableSet:
    Set<string>,
  strengthOccurrenceKeys:
    Set<string>
) {
  function isStrength(
    activity:
      RearrangementActivityOptions
  ) {
    return strengthOccurrenceKeys.has(
      [
        activity.trainingActivityId,
        activity.originalDate,
      ].join("|")
    );
  }

  function getPriority(
    activity:
      RearrangementActivityOptions
  ) {
    const requiredMove =
      unavailableSet.has(
        activity.originalDate
      );

    const strength =
      isStrength(
        activity
      );

    if (
      requiredMove &&
      strength
    ) {
      return 0;
    }

    if (strength) {
      return 1;
    }

    if (requiredMove) {
      return 2;
    }

    return 3;
  }

  return [
    ...activities,
  ].sort(
    (
      first,
      second
    ) => {
      const priorityDifference =
        getPriority(first) -
        getPriority(second);

      if (
        priorityDifference !==
        0
      ) {
        return priorityDifference;
      }

      if (
        first.candidateDates.length !==
        second.candidateDates.length
      ) {
        return (
          first.candidateDates.length -
          second.candidateDates.length
        );
      }

      return [
        first.originalDate,
        first.trainingActivityId,
      ]
        .join("|")
        .localeCompare(
          [
            second.originalDate,
            second.trainingActivityId,
          ].join("|")
        );
    }
  );
}


// ============================================================
// Evaluate Node
// ============================================================

function evaluateNode(
  state:
    TrainingPlanState,
  weekStartDate:
    string,
  unavailableDates:
    string[],
  moves:
    WeeklyScheduleRearrangementMove[]
) {
  return evaluateWeeklyScheduleRearrangement({
    state,

    weekStartDate,

    moves,

    unavailableDates,
  });
}


// ============================================================
// Adaptive Beam Search
// ============================================================

export function searchAdaptiveWeeklyRearrangements({
  state,
  weekStartDate,
  activities,
  unavailableDates = [],
  beamWidth = 60,
  maxEvaluations = 2500,
  maxResults = 20,
}: SearchAdaptiveWeeklyRearrangementsInput):
  WeeklyScheduleRearrangementEvaluation[] {

  if (
    activities.length ===
    0
  ) {
    return [];
  }


  const unavailableSet =
    new Set(
      unavailableDates
    );


  const strengthOccurrenceKeys =
    getStrengthOccurrenceKeys(
      state,
      weekStartDate
    );


  const orderedActivities =
    orderActivities(
      activities,
      unavailableSet,
      strengthOccurrenceKeys
    );


  // ----------------------------------------------------------
  // Initial State
  // ----------------------------------------------------------

  const initialEvaluation =
    evaluateNode(
      state,
      weekStartDate,
      unavailableDates,
      []
    );


  if (!initialEvaluation) {
    return [];
  }


  let evaluationsUsed =
    1;


  let beam:
    SearchNode[] = [
      {
        moves:
          [],

        evaluation:
          initialEvaluation,

        searchScore:
          initialEvaluation.score,
      },
    ];


  // ----------------------------------------------------------
  // Incremental Search
  // ----------------------------------------------------------
  //
  // The old implementation treated maxEvaluations as a hard
  // interruption point inside a stage. That allowed a partially
  // processed beam to be returned as though it represented final
  // weekly rearrangements.
  //
  // This version is stage-complete:
  //
  // 1. Determine the budget available for the current activity.
  // 2. Reserve at least one evaluation for every later activity.
  // 3. Reduce the number of parent nodes expanded when necessary.
  // 4. Finish the current activity completely for those parents.
  // 5. If the remaining global budget cannot complete all later
  //    activities, return no recommendations rather than partial
  //    schedules.

  for (
    let activityIndex = 0;
    activityIndex <
      orderedActivities.length;
    activityIndex += 1
  ) {
    const activity =
      orderedActivities[
        activityIndex
      ];

    const remainingActivities =
      orderedActivities.slice(
        activityIndex + 1
      );

    const candidateDates =
      getCandidateDates(
        activity,
        unavailableSet
      );


    // A participating activity with no legal choice means this
    // search space cannot produce a complete weekly proposal.

    if (
      candidateDates.length ===
      0
    ) {
      return [];
    }


    const stagesRemainingAfterThis =
      remainingActivities.length;

    const evaluationsRemaining =
      maxEvaluations -
      evaluationsUsed;

    // Reserve one evaluator call for each later stage. This is the
    // minimum needed to guarantee that every participating activity
    // gets processed before anything can be returned.

    const currentStageBudget =
      evaluationsRemaining -
      stagesRemainingAfterThis;


    if (
      currentStageBudget <=
      0
    ) {
      return [];
    }


    // Expand only as many complete parent nodes as fit inside the
    // current-stage budget. We never stop halfway through a parent
    // node's candidate-date choices.

    const maxParentsThisStage =
      Math.floor(
        currentStageBudget /
          candidateDates.length
      );


    if (
      maxParentsThisStage <=
      0
    ) {
      return [];
    }


    const parentNodes =
      beam.slice(
        0,
        Math.min(
          beam.length,
          maxParentsThisStage
        )
      );


    const nextNodes:
      SearchNode[] =
        [];


    const seenMoveSets =
      new Set<string>();


    for (
      const node
      of parentNodes
    ) {
      for (
        const candidateDate
        of candidateDates
      ) {
        const moves =
          addActivityChoice(
            node.moves,
            activity,
            candidateDate
          );


        const key =
          getMoveSetKey(
            moves
          );


        if (
          seenMoveSets.has(
            key
          )
        ) {
          continue;
        }


        seenMoveSets.add(
          key
        );


        // This guard should normally be unreachable because the
        // parent count was calculated from the available stage
        // budget. Keep it as an emergency correctness check.

        if (
          evaluationsUsed >=
          maxEvaluations
        ) {
          return [];
        }


        const evaluation =
          evaluateNode(
            state,
            weekStartDate,
            unavailableDates,
            moves
          );


        evaluationsUsed +=
          1;


        if (!evaluation) {
          continue;
        }


        nextNodes.push({
          moves,

          evaluation,

          searchScore:
            getPartialSearchScore(
              evaluation,
              remainingActivities
            ),
        });
      }
    }


    if (
      nextNodes.length ===
      0
    ) {
      return [];
    }


    // --------------------------------------------------------
    // Beam Pruning
    // --------------------------------------------------------
    //
    // Partial nodes use the optimistic search score. The final
    // stage has no remaining activities, so getPartialSearchScore
    // naturally falls back to the evaluator's real score.

    nextNodes.sort(
      compareSearchNodes
    );


    beam =
      nextNodes.slice(
        0,
        Math.max(
          1,
          beamWidth
        )
      );
  }


  // ----------------------------------------------------------
  // Final Ranking / Dedupe
  // ----------------------------------------------------------
  //
  // Reaching this point guarantees every ordered activity was
  // processed. No partial beam can escape as a recommendation.

  const finalByKey =
    new Map<
      string,
      WeeklyScheduleRearrangementEvaluation
    >();


  for (
    const node
    of beam
  ) {
    const key =
      getMoveSetKey(
        node.evaluation.moves
      );


    const existing =
      finalByKey.get(
        key
      );


    if (
      !existing ||
      compareEvaluations(
        node.evaluation,
        existing
      ) <
        0
    ) {
      finalByKey.set(
        key,
        node.evaluation
      );
    }
  }


  const results =
    Array.from(
      finalByKey.values()
    );


  results.sort(
    compareEvaluations
  );


  return results.slice(
    0,
    Math.max(
      1,
      maxResults
    )
  );
}
