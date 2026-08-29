import type {
  Exercise,
  ExerciseDefinition,
} from "./types";

import {
  isValidRpe,
  RPE_HIGH_EFFORT_MIN,
} from "./rpe";

// ============================================================
// Types
// ============================================================

export type ExerciseTargetAction =
  | "increase-load"
  | "reduce-load"
  | "build-reps"
  | "reduce-assistance"
  | "increase-assistance"
  | "build-duration"
  | "next-variation"
  | "repeat"
  | "review-load"
  | "insufficient-data"
  | "no-history"
  | "no-progression";

export interface ExerciseTarget {
  action: ExerciseTargetAction;

  // Short text intended for the workout card.
  label: string;

  // More detailed explanation that we can use later
  // in the Guide / Coach system.
  message: string;

  targetWeight?: number;
  repMin?: number;
  repMax?: number;

  // Permanent Exercise Library ID of the harder
  // variation recommended after mastery.
  nextVariationId?: string;
}

// ============================================================
// Helpers
// ============================================================

function getCompletedSets(
  exercise: Exercise
) {
  return exercise.sets.filter(
    (set) => set.completed
  );
}

// ------------------------------------------------------------
// Consistently Below Range
// ------------------------------------------------------------

function isConsistentlyBelowRange(
  exercise: Exercise,
  minimum: number
) {
  const completedSets =
    getCompletedSets(exercise);

  if (completedSets.length === 0) {
    return false;
  }

  const setsBelowMinimum =
    completedSets.filter(
      (set) => set.reps < minimum
    ).length;

  // "Review load" should represent a pattern,
  // not one unusually difficult set.
  //
  // More than half of the completed working sets
  // must fall below the minimum.
  return (
    setsBelowMinimum >
    completedSets.length / 2
  );
}

// ============================================================
// Exercise Target
// ============================================================

export function getExerciseTarget(
  definition: ExerciseDefinition | undefined,
  previousExercise: Exercise | undefined
): ExerciseTarget {
  // ----------------------------------------------------------
  // Missing Programming
  // ----------------------------------------------------------

  if (
    !definition ||
    definition.repMin === undefined ||
    definition.repMax === undefined
  ) {
    return {
      action: "no-progression",
      label: "No target",
      message:
        "No progression rule is configured for this exercise.",
    };
  }

  const {
    repMin,
    repMax,
    increment = 0,
    nextVariationId,
  } = definition;

  // ==========================================================
  // Metric Model
  // ==========================================================
  //
  // resistanceType + performanceType are now authoritative.
  //
  // The progressionType fallbacks below exist only so older
  // exercise definitions remain usable during migration.
  // ==========================================================

  const resistanceType =
    definition.resistanceType ??
    (
      definition.progressionType === "Load"
        ? "Weight"
        : definition.progressionType === "Assistance"
          ? "Assistance"
          : "None"
    );

  const performanceType =
    definition.performanceType ??
    (
      definition.progressionType === "Duration"
        ? "Duration"
        : "Reps"
    );

  const usesWeight =
    resistanceType === "Weight";

  const usesBand =
    resistanceType === "Band";

  const usesAssistance =
    resistanceType === "Assistance";

  const usesDuration =
    performanceType === "Duration";

  const usesReps =
    performanceType === "Reps";

  // ----------------------------------------------------------
  // Target Label Helper
  // ----------------------------------------------------------

  const getBaseTargetLabel = () => {
    if (usesDuration) {
      return `${repMin}–${repMax} sec`;
    }

    return `${repMin}–${repMax} reps`;
  };

  // ----------------------------------------------------------
  // No Previous Workout
  // ----------------------------------------------------------

  if (!previousExercise) {
    return {
      action: "no-history",
      label: getBaseTargetLabel(),
      message:
        "No previous performance found. Choose an appropriate starting point within the target range.",
      repMin,
      repMax,
    };
  }

  // ----------------------------------------------------------
  // Prescribed Set Count
  // ----------------------------------------------------------

  const prescribedSetCount =
    Math.max(
      1,
      previousExercise.prescribedSetCount ??
        previousExercise.sets.length
    );

  // ----------------------------------------------------------
  // Completed Sets
  // ----------------------------------------------------------

  const completedSets =
    getCompletedSets(
      previousExercise
    );

  if (completedSets.length === 0) {
    return {
      action: "no-history",
      label: getBaseTargetLabel(),
      message:
        "No completed previous sets were found. Choose an appropriate starting point within the target range.",
      repMin,
      repMax,
    };
  }

  const previousWeight =
    completedSets[0].weight;

  // ==========================================================
  // Incomplete Exercise
  // ==========================================================

  const exerciseWasCompleted =
    completedSets.length >=
    prescribedSetCount;

  if (!exerciseWasCompleted) {
    let label =
      getBaseTargetLabel();

    // Weight + Duration
    if (
      usesWeight &&
      usesDuration
    ) {
      label =
        `${previousWeight} lb × ${repMin}–${repMax} sec`;
    }

    // Weight + Reps
    else if (
      usesWeight &&
      usesReps
    ) {
      label =
        `${previousWeight} lb × ${repMin}–${repMax}`;
    }

    // Band + Reps
    else if (
      usesBand &&
      usesReps
    ) {
      label =
        previousWeight > 0
          ? `${previousWeight} lb band × ${repMin}–${repMax}`
          : `${repMin}–${repMax} reps`;
    }

    // Assistance + Reps
    else if (
      usesAssistance &&
      usesReps
    ) {
      label =
        `${previousWeight} lb assist × ${repMin}–${repMax}`;
    }

    return {
      action:
        "insufficient-data",

      label,

      message:
        `Only ${completedSets.length} of ${prescribedSetCount} prescribed working sets were completed. Keep the current target until a full exercise is recorded.`,

      targetWeight:
        usesWeight ||
        usesBand ||
        usesAssistance
          ? previousWeight
          : undefined,

      repMin,
      repMax,
    };
  }

  // ==========================================================
  // Shared Performance Checks
  // ==========================================================

  const reachedTopOfRange =
    completedSets.every(
      (set) =>
        set.reps >= repMax
    );

  // RPE is optional and was added after workout history already
  // existed. Only reported values participate in this guard so
  // older workouts keep their original progression behavior.
  const highestReportedRpe =
    completedSets.reduce<number | undefined>(
      (highest, set) => {
        if (
          !isValidRpe(
            set.rpe
          )
        ) {
          return highest;
        }

        return highest === undefined
          ? set.rpe
          : Math.max(highest, set.rpe);
      },
      undefined
    );

  const reachedTopWithHighEffort =
    reachedTopOfRange &&
    highestReportedRpe !== undefined &&
    highestReportedRpe >=
      RPE_HIGH_EFFORT_MIN;

  const belowTarget =
    isConsistentlyBelowRange(
      previousExercise,
      repMin
    );

  // Reaching the top of the programmed range at RPE 9–10 is
  // successful work, but not yet a signal to increase difficulty.
  // Repeat the current target until it can be completed with more
  // reserve. This applies consistently to load, assistance,
  // duration, bodyweight, and exercise-variation progression.
  if (reachedTopWithHighEffort) {
    let label = getBaseTargetLabel();

    if (usesWeight && usesDuration) {
      label =
        `${previousWeight} lb × ${repMin}–${repMax} sec`;
    } else if (usesWeight && usesReps) {
      label =
        `${previousWeight} lb × ${repMin}–${repMax}`;
    } else if (usesBand && usesReps) {
      label =
        previousWeight > 0
          ? `${previousWeight} lb band × ${repMin}–${repMax}`
          : `${repMin}–${repMax} reps`;
    } else if (usesAssistance && usesReps) {
      label =
        `${previousWeight} lb assist × ${repMin}–${repMax}`;
    }

    return {
      action: "repeat",
      label,
      message:
        `All working sets reached the top of the target range, but the highest reported effort was RPE ${highestReportedRpe}. Repeat the current target before increasing difficulty.`,
      targetWeight:
        usesWeight ||
        usesBand ||
        usesAssistance
          ? previousWeight
          : undefined,
      repMin,
      repMax,
    };
  }

  // ==========================================================
  // Weight + Duration
  // ==========================================================

  if (
    usesWeight &&
    usesDuration
  ) {
    if (reachedTopOfRange) {
      const targetWeight =
        previousWeight +
        increment;

      return {
        action:
          "increase-load",

        label:
          `${targetWeight} lb × ${repMin}–${repMax} sec`,

        message:
          `All working sets reached ${repMax} seconds. Increase the load by ${increment} lb.`,

        targetWeight,
        repMin,
        repMax,
      };
    }

    if (belowTarget) {
      if (increment > 0) {
        const targetWeight =
          Math.max(
            0,
            previousWeight - increment
          );

        return {
          action:
            "reduce-load",

          label:
            `${targetWeight} lb × ${repMin}–${repMax} sec`,

          message:
            `Most working sets fell below the ${repMin}-second minimum. Reduce the load by ${increment} lb next time.`,

          targetWeight,
          repMin,
          repMax,
        };
      }

      return {
        action:
          "review-load",

        label:
          `${previousWeight} lb × ${repMin}–${repMax} sec`,

        message:
          `Most working sets fell below the ${repMin}-second minimum. Review whether the current load is appropriate before the next workout.`,

        targetWeight:
          previousWeight,

        repMin,
        repMax,
      };
    }

    return {
      action:
        "build-duration",

      label:
        `${previousWeight} lb × ${repMin}–${repMax} sec`,

      message:
        `Keep the same load and continue building toward ${repMax} seconds on every working set.`,

      targetWeight:
        previousWeight,

      repMin,
      repMax,
    };
  }

  // ==========================================================
  // Weight + Reps
  // ==========================================================

  if (
    usesWeight &&
    usesReps
  ) {
    if (reachedTopOfRange) {
      const targetWeight =
        previousWeight +
        increment;

      return {
        action:
          "increase-load",

        label:
          `${targetWeight} lb × ${repMin}–${repMax}`,

        message:
          `All working sets reached ${repMax} reps. Increase the load by ${increment} lb.`,

        targetWeight,
        repMin,
        repMax,
      };
    }

    if (belowTarget) {
      if (increment > 0) {
        const targetWeight =
          Math.max(
            0,
            previousWeight - increment
          );

        return {
          action:
            "reduce-load",

          label:
            `${targetWeight} lb × ${repMin}–${repMax}`,

          message:
            `Most working sets fell below the ${repMin}-rep minimum. Reduce the load by ${increment} lb next time.`,

          targetWeight,
          repMin,
          repMax,
        };
      }

      return {
        action:
          "review-load",

        label:
          `${previousWeight} lb × ${repMin}–${repMax}`,

        message:
          `Most working sets fell below the ${repMin}-rep minimum. Review whether the current load is appropriate before the next workout.`,

        targetWeight:
          previousWeight,

        repMin,
        repMax,
      };
    }

    return {
      action:
        "build-reps",

      label:
        `${previousWeight} lb × ${repMin}–${repMax}`,

      message:
        `Keep the same load and continue building toward ${repMax} reps on every working set.`,

      targetWeight:
        previousWeight,

      repMin,
      repMax,
    };
  }

  // ==========================================================
  // Band + Reps
  // ==========================================================

  if (
    usesBand &&
    usesReps
  ) {
    // No band resistance was recorded in the previous workout.
    // Keep the rep target useful without presenting a misleading
    // "0 lb" load recommendation.
    if (previousWeight <= 0) {
      return {
        action:
          "build-reps",

        label:
          `${repMin}–${repMax} reps`,

        message:
          `Choose an appropriate band resistance and build toward ${repMax} reps on every working set.`,

        targetWeight:
          undefined,

        repMin,
        repMax,
      };
    }

    if (reachedTopOfRange) {
      return {
        action:
          "repeat",

        label:
          `${previousWeight} lb band × ${repMin}–${repMax}`,

        message:
          `All working sets reached the top of the target range with the ${previousWeight} lb band. Repeat this resistance or choose a stronger band when the current band feels appropriately controlled.`,

        targetWeight:
          previousWeight,

        repMin,
        repMax,
      };
    }

    if (belowTarget) {
      return {
        action:
          "review-load",

        label:
          `${previousWeight} lb band × ${repMin}–${repMax}`,

        message:
          `Most working sets fell below the ${repMin}-rep minimum. Review whether the ${previousWeight} lb band is too difficult before the next workout.`,

        targetWeight:
          previousWeight,

        repMin,
        repMax,
      };
    }

    return {
      action:
        "build-reps",

      label:
        `${previousWeight} lb band × ${repMin}–${repMax}`,

      message:
        `Keep the same ${previousWeight} lb band and continue building toward ${repMax} reps on every working set.`,

      targetWeight:
        previousWeight,

      repMin,
      repMax,
    };
  }


  // ==========================================================
  // Assistance + Reps
  // ==========================================================

  if (
    usesAssistance &&
    usesReps
  ) {
    if (
      reachedTopOfRange &&
      increment > 0
    ) {
      // For assisted exercises, LOWER weight means
      // less assistance and therefore more difficulty.
      const targetAssistance =
        Math.max(
          0,
          previousWeight -
            increment
        );

      return {
        action:
          "reduce-assistance",

        label:
          `${targetAssistance} lb assist × ${repMin}–${repMax}`,

        message:
          `All working sets reached ${repMax} reps. Reduce assistance by ${increment} lb.`,

        targetWeight:
          targetAssistance,

        repMin,
        repMax,
      };
    }

    if (belowTarget) {
      if (increment > 0) {
        const targetAssistance =
          previousWeight + increment;

        return {
          action:
            "increase-assistance",

          label:
            `${targetAssistance} lb assist × ${repMin}–${repMax}`,

          message:
            `Most working sets fell below the ${repMin}-rep minimum. Add ${increment} lb of assistance next time.`,

          targetWeight:
            targetAssistance,

          repMin,
          repMax,
        };
      }

      return {
        action:
          "review-load",

        label:
          `${previousWeight} lb assist × ${repMin}–${repMax}`,

        message:
          `Most working sets fell below the ${repMin}-rep minimum. Review whether more assistance is appropriate next time.`,

        targetWeight:
          previousWeight,

        repMin,
        repMax,
      };
    }

    return {
      action:
        "build-reps",

      label:
        `${previousWeight} lb assist × ${repMin}–${repMax}`,

      message:
        `Keep the same assistance and build toward ${repMax} reps on every working set.`,

      targetWeight:
        previousWeight,

      repMin,
      repMax,
    };
  }

  // ==========================================================
  // None + Reps
  // ==========================================================

  if (
    resistanceType === "None" &&
    usesReps
  ) {
    // --------------------------------------------------------
    // Next Variation
    // --------------------------------------------------------

    if (
      reachedTopOfRange &&
      nextVariationId
    ) {
      return {
        action:
          "next-variation",

        label:
          `${repMax} reps mastered`,

        message:
          `All working sets reached ${repMax} reps. You are ready for a harder exercise variation.`,

        nextVariationId,

        repMin,
        repMax,
      };
    }

    // --------------------------------------------------------
    // Final Variation
    // --------------------------------------------------------

    if (reachedTopOfRange) {
      return {
        action: "repeat",

        label:
          `${repMax}+ reps`,

        message:
          `All working sets reached the top of the ${repMin}–${repMax} rep range.`,

        repMin,
        repMax,
      };
    }

    // --------------------------------------------------------
    // Build Reps
    // --------------------------------------------------------

    return {
      action:
        "build-reps",

      label:
        `${repMin}–${repMax} reps`,

      message:
        `Continue adding repetitions until every working set reaches ${repMax} reps.`,

      repMin,
      repMax,
    };
  }

  // ==========================================================
  // None + Duration
  // ==========================================================

  if (
    resistanceType === "None" &&
    usesDuration
  ) {
    // --------------------------------------------------------
    // Next Variation
    // --------------------------------------------------------

    if (
      reachedTopOfRange &&
      nextVariationId
    ) {
      return {
        action:
          "next-variation",

        label:
          `${repMax} sec mastered`,

        message:
          `All working sets reached ${repMax} seconds. You are ready for a harder exercise variation.`,

        nextVariationId,

        repMin,
        repMax,
      };
    }

    // --------------------------------------------------------
    // Final Variation
    // --------------------------------------------------------

    if (reachedTopOfRange) {
      return {
        action: "repeat",

        label:
          `${repMax} sec`,

        message:
          `All working sets reached ${repMax} seconds.`,

        repMin,
        repMax,
      };
    }

    // --------------------------------------------------------
    // Build Duration
    // --------------------------------------------------------

    return {
      action:
        "build-duration",

      label:
        `${repMin}–${repMax} sec`,

      message:
        `Continue increasing hold time until every working set reaches ${repMax} seconds.`,

      repMin,
      repMax,
    };
  }

  // ----------------------------------------------------------
  // Fallback
  // ----------------------------------------------------------

  return {
    action:
      "no-progression",

    label: "No target",

    message:
      "No progression rule is configured for this exercise.",
  };
}
