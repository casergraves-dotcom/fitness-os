import type { Exercise, ExerciseSet } from "../types";

export interface StrengthTemplateSetChange {
  exerciseId: string;
  nextSetCount: number;
}

export interface ApplyStrengthTemplateSetChangesOptions {
  createSetId: (exerciseId: string, setIndex: number) => string;
}

function createBlankSet(id: string): ExerciseSet {
  return {
    id,
    weight: 0,
    reps: 0,
    completed: false,
  };
}

export function applyStrengthTemplateSetChanges(
  template: Exercise[],
  changes: StrengthTemplateSetChange[],
  options: ApplyStrengthTemplateSetChangesOptions
): Exercise[] {
  const changesByExerciseId = new Map(
    changes.map((change) => [change.exerciseId, change])
  );

  return template.map((exercise) => {
    const change = changesByExerciseId.get(exercise.id);

    if (!change) {
      return {
        ...exercise,
        sets: exercise.sets.map((set) => ({ ...set })),
        rampUpSets: exercise.rampUpSets?.map((set) => ({ ...set })),
      };
    }

    const currentSetCount = exercise.sets.length;
    const nextSetCount = Math.max(1, Math.min(10, change.nextSetCount));
    const difference = nextSetCount - currentSetCount;

    if (Math.abs(difference) > 1) {
      throw new Error(
        `Strength template changes are limited to one set per exercise: ${exercise.id}`
      );
    }

    const retainedSets = exercise.sets
      .slice(0, nextSetCount)
      .map((set) => ({ ...set }));

    const addedSets = Array.from(
      { length: Math.max(0, difference) },
      (_, offset) =>
        createBlankSet(
          options.createSetId(exercise.id, currentSetCount + offset)
        )
    );

    return {
      ...exercise,
      prescribedSetCount: nextSetCount,
      sets: [...retainedSets, ...addedSets],
      rampUpSets: exercise.rampUpSets?.map((set) => ({ ...set })),
    };
  });
}
