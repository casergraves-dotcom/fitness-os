import { exerciseLibrary } from "./exerciseLibrary.ts";
import { strengthWorkoutIntents } from "./backupWorkoutModel.ts";
import {
  getExerciseMuscleContribution,
  getExerciseProgrammingRole,
} from "./exerciseClassification.ts";

import type {
  Exercise,
  ExerciseDefinition,
  ExerciseMuscleGroup,
  StrengthWorkoutType,
} from "./types";

function getPrescriptionFocus(definition: ExerciseDefinition) {
  if (definition.performanceType === "Duration") return "Control / stability";
  if (definition.repMax === undefined) return "Needs review";
  if (definition.repMax <= 8) return "Strength emphasis";
  if (definition.repMax <= 12) return "Strength + muscle";
  return "Higher-rep support";
}

export function getWorkoutVolumeAudit(
  template: Exercise[],
  definitions: ExerciseDefinition[] = exerciseLibrary,
  workoutType?: StrengthWorkoutType
) {
  const intent = workoutType ? strengthWorkoutIntents[workoutType] : undefined;
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
        intent: "Needs review" as const,
        repRange: "Needs setup",
        prescriptionFocus: "Needs review",
        directMuscles: [] as ExerciseMuscleGroup[],
        secondaryMuscles: [] as ExerciseMuscleGroup[],
        needsReview: true,
      };
    }

    const role = getExerciseProgrammingRole(definition);
    const contribution = getExerciseMuscleContribution(definition);
    const isRequired = intent?.roles.some(
      (intentRole) => intentRole.required
        && definition.movementRoles?.includes(intentRole.role)
    );
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
      intent: isRequired ? "Required" as const : "Support" as const,
      repRange,
      prescriptionFocus: getPrescriptionFocus(definition),
      directMuscles: contribution.direct,
      secondaryMuscles: contribution.secondary,
      needsReview: !hasRepRange || setCountOutsideBaseline,
    };
  });

  const muscleVolume = [...new Set(
    rows.flatMap((row) => [...row.directMuscles, ...row.secondaryMuscles])
  )]
    .map((muscle) => {
      const directRows = rows.filter((row) => row.directMuscles.includes(muscle));
      const secondaryRows = rows.filter((row) => row.secondaryMuscles.includes(muscle));

      return {
        muscle,
        directSets: directRows.reduce((total, row) => total + row.setCount, 0),
        secondarySets: secondaryRows.reduce((total, row) => total + row.setCount, 0),
        repRanges: [...new Set(directRows.map((row) => row.repRange))],
      };
    })
    .sort((first, second) =>
      second.directSets - first.directSets
      || second.secondarySets - first.secondarySets
      || first.muscle.localeCompare(second.muscle)
    );

  return {
    totalSets: rows.reduce((total, row) => total + row.setCount, 0),
    primarySets: rows
      .filter((row) => row.role === "Primary")
      .reduce((total, row) => total + row.setCount, 0),
    accessorySets: rows
      .filter((row) => row.role === "Accessory")
      .reduce((total, row) => total + row.setCount, 0),
    requiredSets: rows
      .filter((row) => row.intent === "Required")
      .reduce((total, row) => total + row.setCount, 0),
    supportSets: rows
      .filter((row) => row.intent === "Support")
      .reduce((total, row) => total + row.setCount, 0),
    reviewCount: rows.filter((row) => row.needsReview).length,
    muscleVolume,
    rows,
  };
}

export function getWorkoutRotationVolumeAudit(
  templates: Record<StrengthWorkoutType, Exercise[]>,
  definitions: ExerciseDefinition[] = exerciseLibrary
) {
  const workoutTypes: StrengthWorkoutType[] = ["Gym A", "Gym B", "Gym C"];
  const workouts = workoutTypes.map((workoutType) => ({
    workoutType,
    audit: getWorkoutVolumeAudit(templates[workoutType], definitions, workoutType),
  }));
  const muscles = [...new Set(
    workouts.flatMap(({ audit }) => audit.muscleVolume.map((row) => row.muscle))
  )];

  const muscleVolume = muscles
    .map((muscle) => {
      const contributions = workouts.map(({ workoutType, audit }) => {
        const contribution = audit.muscleVolume.find((row) => row.muscle === muscle);
        return {
          workoutType,
          directSets: contribution?.directSets ?? 0,
          secondarySets: contribution?.secondarySets ?? 0,
          repRanges: contribution?.repRanges ?? [],
        };
      });

      return {
        muscle,
        directSets: contributions.reduce((total, row) => total + row.directSets, 0),
        secondarySets: contributions.reduce((total, row) => total + row.secondarySets, 0),
        directSessionCount: contributions.filter((row) => row.directSets > 0).length,
        repRanges: [...new Set(contributions.flatMap((row) => row.repRanges))],
        workouts: contributions.filter(
          (row) => row.directSets > 0 || row.secondarySets > 0
        ),
      };
    })
    .sort((first, second) =>
      second.directSets - first.directSets
      || second.directSessionCount - first.directSessionCount
      || second.secondarySets - first.secondarySets
      || first.muscle.localeCompare(second.muscle)
    );

  return {
    totalSets: workouts.reduce((total, row) => total + row.audit.totalSets, 0),
    muscleVolume,
    workouts,
  };
}
