import type {
  ExerciseDefinition,
  StrengthMovementRole,
  WorkoutEquipment,
  WorkoutSetupCapability,
} from "./types";

export type ExerciseSubstitutionEnvironment = "Gym" | "Home";

export interface ExerciseSubstitutionContext {
  environment: ExerciseSubstitutionEnvironment;
  availableEquipment: WorkoutEquipment[];
  availableCapabilities: WorkoutSetupCapability[];
  unavailableExerciseIds?: string[];
}

export interface ExerciseSubstitutionOption {
  exercise: ExerciseDefinition;
  sharedRoles: StrengthMovementRole[];
  score: number;
}

const PREFERRED_SUBSTITUTIONS: Record<string, string[]> = {
  "chest-press-machine": ["dumbbell-chest-press", "incline-chest-press-machine", "push-ups", "feet-elevated-push-ups"],
  "incline-chest-press-machine": ["incline-dumbbell-press", "dumbbell-chest-press", "chest-press-machine", "push-ups"],
  "barbell-bench-press": ["dumbbell-chest-press", "chest-press-machine", "push-ups"],
  "incline-dumbbell-press": ["incline-chest-press-machine", "dumbbell-chest-press", "barbell-bench-press"],
  "chest-fly": ["cable-fly", "dumbbell-fly"],
  "cable-fly": ["chest-fly", "dumbbell-fly"],
  "dumbbell-fly": ["chest-fly", "cable-fly"],
  "seated-row": ["cable-row", "one-arm-dumbbell-row", "barbell-row", "band-row", "backpack-row"],
  "barbell-row": ["seated-row", "cable-row", "one-arm-dumbbell-row", "band-row"],
  "lat-pulldown": ["assisted-pull-up", "band-pulldown"],
  "shoulder-press-machine": ["dumbbell-shoulder-press", "overhead-press", "band-shoulder-press"],
  "overhead-press": ["dumbbell-shoulder-press", "shoulder-press-machine", "band-shoulder-press"],
  "leg-press": ["hack-squat-pendulum-squat", "goblet-squat", "reverse-lunge", "barbell-squat"],
  "hack-squat-pendulum-squat": ["leg-press", "barbell-squat", "goblet-squat", "reverse-lunge"],
  "barbell-squat": ["hack-squat-pendulum-squat", "leg-press", "goblet-squat", "reverse-lunge"],
  "leg-curl": ["lying-leg-curl", "band-leg-curl"],
  "lying-leg-curl": ["leg-curl", "band-leg-curl"],
  "band-leg-curl": ["leg-curl", "lying-leg-curl"],
  "dumbbell-rdl": ["romanian-deadlift", "band-good-morning"],
  "romanian-deadlift": ["dumbbell-rdl", "band-good-morning"],
  "band-good-morning": ["dumbbell-rdl", "romanian-deadlift"],
  "hip-abductor": ["side-lying-hip-abduction"],
  "hip-adductor": ["side-lying-hip-adduction"],
  "calf-raise": ["standing-calf-raise-machine", "seated-calf-raise-machine"],
  "standing-calf-raise-machine": ["seated-calf-raise-machine", "calf-raise"],
  "seated-calf-raise-machine": ["standing-calf-raise-machine", "calf-raise"],
  "lateral-raise-machine": ["dumbbell-lateral-raise"],
  "dumbbell-lateral-raise": ["lateral-raise-machine"],
  "reverse-pec-deck": ["cable-face-pull"],
  "cable-face-pull": ["reverse-pec-deck"],
  "biceps-curl-machine": ["dumbbell-curl", "barbell-curl", "band-biceps-curl"],
  "dumbbell-curl": ["biceps-curl-machine", "barbell-curl", "band-biceps-curl"],
  "barbell-curl": ["biceps-curl-machine", "dumbbell-curl", "band-biceps-curl"],
  "band-biceps-curl": ["dumbbell-curl", "barbell-curl", "biceps-curl-machine"],
  "triceps-press-machine": ["seated-dip-machine", "cable-pressdown", "band-overhead-triceps-extension"],
  "seated-dip-machine": ["triceps-press-machine", "cable-pressdown", "band-overhead-triceps-extension"],
  "cable-pressdown": ["triceps-press-machine", "seated-dip-machine", "band-overhead-triceps-extension"],
  "band-overhead-triceps-extension": ["cable-pressdown", "triceps-press-machine", "seated-dip-machine"],
  "cable-woodchop": ["band-woodchop"],
  "band-woodchop": ["cable-woodchop"],
  "ab-crunch-machine": ["cable-crunch"],
  "cable-crunch": ["ab-crunch-machine"],
  "hanging-leg-raise": ["lying-leg-raise"],
  "lying-leg-raise": ["hanging-leg-raise"],
};

function isAvailable(exercise: ExerciseDefinition, context: ExerciseSubstitutionContext) {
  if (context.unavailableExerciseIds?.includes(exercise.id)) return false;

  const equipmentOk = (exercise.requiredEquipment ?? []).every(
    (item) => context.availableEquipment.includes(item)
  );
  const capabilitiesOk = (exercise.requiredCapabilities ?? []).every(
    (item) => context.availableCapabilities.includes(item)
  );

  return equipmentOk && capabilitiesOk;
}

function hasCompleteProgressionMetadata(
  exercise: ExerciseDefinition
) {
  return (
    exercise.repMin !== undefined &&
    exercise.repMax !== undefined &&
    exercise.increment !== undefined &&
    exercise.resistanceType !== undefined &&
    exercise.performanceType !== undefined
  );
}

function getSharedRoles(source: ExerciseDefinition, candidate: ExerciseDefinition) {
  const candidateRoles = candidate.movementRoles ?? [];
  return (source.movementRoles ?? []).filter(
    (role) => candidateRoles.includes(role)
  );
}

function getScore(
  source: ExerciseDefinition,
  candidate: ExerciseDefinition,
  sharedRoles: StrengthMovementRole[],
  context: ExerciseSubstitutionContext
) {
  let score = sharedRoles.length * 100;

  if (source.category === candidate.category) score += 20;

  const preferred = PREFERRED_SUBSTITUTIONS[source.id] ?? [];
  const preferredIndex = preferred.indexOf(candidate.id);
  if (preferredIndex >= 0) score += 80 - preferredIndex * 10;

  if (
    context.environment === "Gym" &&
    candidate.requiredEquipment?.some(
      (item) =>
        item === "GymMachines" ||
        item === "Dumbbells" ||
        item === "Barbell"
    )
  ) {
    score += 15;
  }

  if (
    context.environment === "Home" &&
    candidate.requiredEquipment?.every(
      (item) =>
        item === "Bodyweight" ||
        item === "YogaMat" ||
        item === "ResistanceBands"
    )
  ) {
    score += 15;
  }

  return score;
}

export function getExerciseSubstitutions(
  exerciseId: string,
  exerciseLibrary: ExerciseDefinition[],
  context: ExerciseSubstitutionContext,
  limit = 5
): ExerciseSubstitutionOption[] {
  const source = exerciseLibrary.find((exercise) => exercise.id === exerciseId);

  if (!source?.movementRoles?.length) return [];

  return exerciseLibrary
    .filter(
      (candidate) =>
        candidate.id !== source.id &&
        isAvailable(candidate, context) &&
        hasCompleteProgressionMetadata(
          candidate
        )
    )
    .map((candidate) => {
      const sharedRoles = getSharedRoles(source, candidate);

      return {
        exercise: candidate,
        sharedRoles,
        score: getScore(source, candidate, sharedRoles, context),
      };
    })
    .filter((option) => option.sharedRoles.length > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.exercise.name.localeCompare(b.exercise.name)
    )
    .slice(0, Math.max(0, limit));
}
