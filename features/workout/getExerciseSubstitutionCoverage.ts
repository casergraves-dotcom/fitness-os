import {
  currentGymWorkoutCapabilities,
  currentGymWorkoutEquipment,
  currentHomeWorkoutCapabilities,
  currentHomeWorkoutEquipment,
} from "./backupWorkoutModel.ts";
import { getExerciseSubstitutions } from "./exerciseSubstitutions.ts";

import type { ExerciseDefinition } from "./types";

export function getExerciseSubstitutionCoverage(
  exercises: ExerciseDefinition[]
) {
  const rows = exercises
    .filter((exercise) => (exercise.movementRoles?.length ?? 0) > 0)
    .map((exercise) => {
      const gymOptions = getExerciseSubstitutions(
        exercise.id,
        exercises,
        {
          environment: "Gym",
          availableEquipment: currentGymWorkoutEquipment,
          availableCapabilities: currentGymWorkoutCapabilities,
        },
        exercises.length
      );
      const homeOptions = getExerciseSubstitutions(
        exercise.id,
        exercises,
        {
          environment: "Home",
          availableEquipment: currentHomeWorkoutEquipment,
          availableCapabilities: currentHomeWorkoutCapabilities,
        },
        exercises.length
      );
      const gymEquivalentCount = gymOptions.filter(
        (option) => option.relationship === "Equivalent"
      ).length;
      const homeEquivalentCount = homeOptions.filter(
        (option) => option.relationship === "Equivalent"
      ).length;
      const fallbackCount = [...gymOptions, ...homeOptions].filter(
        (option) => option.relationship === "Fallback"
      ).length;

      return {
        exerciseId: exercise.id,
        name: exercise.name,
        gymEquivalentCount,
        homeEquivalentCount,
        fallbackCount,
        status: gymEquivalentCount > 0 && homeEquivalentCount > 0
          ? "Gym + Home" as const
          : gymEquivalentCount > 0
            ? "Gym only" as const
            : homeEquivalentCount > 0
              ? "Home only" as const
              : fallbackCount > 0
                ? "Fallback only" as const
                : "Endpoint" as const,
      };
    })
    .sort((first, second) => {
      const firstGap = first.gymEquivalentCount === 0 || first.homeEquivalentCount === 0;
      const secondGap = second.gymEquivalentCount === 0 || second.homeEquivalentCount === 0;
      return Number(secondGap) - Number(firstGap) || first.name.localeCompare(second.name);
    });

  return {
    exerciseCount: rows.length,
    gymCoveredCount: rows.filter((row) => row.gymEquivalentCount > 0).length,
    homeCoveredCount: rows.filter((row) => row.homeEquivalentCount > 0).length,
    endpointCount: rows.filter((row) => row.status === "Endpoint").length,
    rows,
  };
}
