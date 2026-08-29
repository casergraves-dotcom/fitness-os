import type {
  StrengthWorkoutType,
  StrengthWorkoutVariantType,
} from "@/features/workout/types";

export type CoachTrainingDecision =
  | "as-planned"
  | "short-workout"
  | "home-workout"
  | "recovery";


export interface CoachReviewContext {
  weekStartDate: string;

  automaticReason: string;

  finalShouldAdvance: boolean;

  manuallyOverridden: boolean;

  overrideReason?: string;
}


export interface CoachReviewContextSummary {
  label: string;

  message: string;
}

export interface CoachObservation {
  type: "CompletedReview" | "PersistentPattern";

  label: string;

  message: string;
}


export interface CoachTrainingContext {
  scheduledActionableCount: number;

  completedActionableCount: number;
}

export interface CoachRecommendation {
  title: string;
  message: string;

  // Optional because recovery/rest days may not need an action.
  button?: string;

  // Optional destination for the Coach card action.
  href?: string;

  // Structured training intent used by downstream workout UI.
  trainingDecision?: CoachTrainingDecision;

  // Present when the recommendation targets a strength workout.
  strengthWorkout?: StrengthWorkoutType;

  // Present when a specific strength-workout variant is recommended.
  strengthVariant?: StrengthWorkoutVariantType;

  // Historical context is explicitly represented as observation,
  // separate from today's actionable recommendation.
  observations?: CoachObservation[];
}
