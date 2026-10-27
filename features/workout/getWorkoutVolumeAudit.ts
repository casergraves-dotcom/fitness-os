import { exerciseLibrary } from "./exerciseLibrary.ts";
import {
  getExerciseMuscleContribution,
  getExerciseProgrammingRole,
} from "./exerciseClassification.ts";

import type {
  Exercise,
  ExerciseDefinition,
} from "./types";

export function getWorkoutVolumeAudit(
  template: Exercise[],
  definitions: ExerciseDefinition[] = exerciseLibrary
) {
  const rows = template.map((exercise) => {
    const definition = definitions.find(
      (candidate) => candidate.id === exercise.exerciseDefinitionId
    );
    const setCount = exercise.sets.length;

    if (!definition) {
      return {
        exerciseId: exercise.id,
        name: exercise.name,
        setCount,
        role: "Accessory" as const,
        repRange: "Needs setup",
        directMuscles: [] as string[],
        secondaryMuscles: [] as string[],
        needsReview: true,
      };
    }

    const role = getExerciseProgrammingRole(definition);
    const contribution = getExerciseMuscleContribution(definition);
    const hasRepRange = definition.repMin !== undefined && definition.repMax !== undefined;
    const repRange = hasRepRange
      ? definition.repMin === definition.repMax
        ? `${definition.repMin} ${definition.performanceType === "Duration" ? "sec" : "reps"}`
        : `${definition.repMin}–${definition.repMax} ${definition.performanceType === "Duration" ? "sec" : "reps"}`
      : "Needs setup";
    const setCountOutsideBaseline = role === "Primary"
      ? setCount < 2 || setCount > 4
      : setCount < 1 || setCount > 3;

    return {
      exerciseId: exercise.id,
      name: exercise.name,
      setCount,
      role,
      repRange,
      directMuscles: contribution.direct,
      secondaryMuscles: contribution.secondary,
      needsReview: !hasRepRange || setCountOutsideBaseline,
    };
  });

  return {
    totalSets: rows.reduce((total, row) => total + row.setCount, 0),
    primarySets: rows
      .filter((row) => row.role === "Primary")
      .reduce((total, row) => total + row.setCount, 0),
    accessorySets: rows
      .filter((row) => row.role === "Accessory")
      .reduce((total, row) => total + row.setCount, 0),
    reviewCount: rows.filter((row) => row.needsReview).length,
    rows,
  };
}
