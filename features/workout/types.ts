// ============================================================
// Workout Sets
// ============================================================

export interface ExerciseSet {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;
}


// ============================================================
// Workout Exercise
// ============================================================

export interface Exercise {
  id: string;

  // Permanent ID from the Exercise Library.
  // Older saved workouts may not have this yet,
  // so keep it optional for backwards compatibility.
  exerciseDefinitionId?: string;

  name: string;

  // Number of working sets prescribed when this exercise
  // was added to the workout.
  //
  // Optional so older saved workouts remain compatible.
  prescribedSetCount?: number;

  sets: ExerciseSet[];
}


// ============================================================
// Workout Types
// ============================================================

// Current strength program.
//
// Gym A / B / C are the active full-body strength workouts
// used by the Fitness OS training plan.
export type StrengthWorkoutType =
  | "Gym A"
  | "Gym B"
  | "Gym C";


// ============================================================
// Strength Training Intent
// ============================================================
//
// Backup workouts should preserve the purpose of the scheduled
// strength session rather than copy exercises one-for-one.
//
// These movement roles describe that purpose in structured data.

export type StrengthMovementRole =
  | "Squat"
  | "SquatGlute"
  | "Hamstrings"
  | "HorizontalPush"
  | "HorizontalPull"
  | "VerticalPush"
  | "VerticalPull"
  | "HipStability"
  | "Adduction"
  | "Core"
  | "Accessory";


// ============================================================
// Workout Equipment
// ============================================================
//
// Equipment requirements describe what must actually be
// available to perform a workout variant.
//
// Owned-but-unavailable equipment should not be treated as
// available equipment.

export type WorkoutEquipment =
  | "Bodyweight"
  | "YogaMat"
  | "ResistanceBands"
  | "PullUpBar"
  | "PunchingBag"
  | "Dumbbells"
  | "Bench"
  | "GymMachines";


// ============================================================
// Workout Setup Capabilities
// ============================================================
//
// Equipment answers "what is available?"
// Capabilities answer "what can safely be set up here?"
//
// Keeping these separate prevents Fitness OS from assuming that
// owning an item automatically makes every exercise using that
// item executable in the current environment.

export type WorkoutSetupCapability =
  | "FloorSpace"
  | "HighAnchor"
  | "LowAnchor"
  | "DoorAnchor"
  | "PullUpBarInstalled";


// ============================================================
// Strength Workout Variants
// ============================================================
//
// FullGym:
// Existing Gym A / B / C prescription.
//
// ShortGym:
// Time-constrained gym version that preserves the highest
// priority movement roles with reduced volume.
//
// Home:
// Home substitute built around available equipment.
//
// Additional variants can be added later without changing the
// scheduled StrengthWorkoutType.

export type StrengthWorkoutVariantType =
  | "FullGym"
  | "ShortGym"
  | "Home";


export interface StrengthWorkoutIntentRole {
  role: StrengthMovementRole;

  required: boolean;
}


export interface StrengthWorkoutIntent {
  strengthWorkout: StrengthWorkoutType;

  roles: StrengthWorkoutIntentRole[];
}


export interface StrengthWorkoutVariantExercise {
  exerciseDefinitionId: string;

  movementRole:
    StrengthMovementRole;

  sets: number;

  optional?: boolean;

  note?: string;
}


export interface StrengthWorkoutVariant {
  id: string;

  label: string;

  // The scheduled Gym A / B / C session whose training intent
  // this variant preserves.
  sourceStrengthWorkout:
    StrengthWorkoutType;

  variantType:
    StrengthWorkoutVariantType;

  requiredEquipment:
    WorkoutEquipment[];

  requiredCapabilities?:
    WorkoutSetupCapability[];

  // Movement roles intentionally covered by this variant.
  movementRoles:
    StrengthMovementRole[];

  exercises:
    StrengthWorkoutVariantExercise[];

  durationMin?: number;
  durationMax?: number;

  note?: string;
}


// Legacy strength workout names.
//
// Keep these available so previously saved Push / Pull / Legs
// workout history remains readable during the migration.
export type LegacyStrengthWorkoutType =
  | "Push"
  | "Pull"
  | "Legs";


// All workout session types that can currently exist.
//
// Run remains here because older/current workout sessions may
// already use it even though running will eventually have its
// own scheduling/programming model.
export type WorkoutType =
  | StrengthWorkoutType
  | LegacyStrengthWorkoutType
  | "Run";


// ============================================================
// Workout Session
// ============================================================

export interface WorkoutSession {
  id: string;

  workoutType: WorkoutType;

  // Strength workout variant actually performed.
  //
  // workoutType remains the underlying scheduled/program workout
  // (Gym A / B / C) so adherence and progression keep their
  // original identity.
  //
  // These fields preserve what the user actually chose to do.
  variantType?: StrengthWorkoutVariantType;

  variantId?: string;

  variantLabel?: string;

  startedAt: string;
  completedAt?: string;
  restStartedAt?: string;

  exercises: Exercise[];

  // Scheduled training-plan activity that launched this workout.
  //
  // These remain optional because manually started workouts do not
  // belong to a scheduled activity.
  scheduledActivityId?: string;

  scheduledDate?: string;
}


// ============================================================
// Run Session
// ============================================================
//
// Stores actual performance from a completed or in-progress
// running session.
//
// This is intentionally separate from WorkoutSession.
//
// WorkoutSession is strength-specific and stores exercises,
// sets, reps, and resistance.
//
// RunSession stores cardio performance such as duration and
// distance.

export interface RunSession {
  id: string;

  startedAt: string;
  completedAt?: string;

  // ----------------------------------------------------------
  // Actual Performance
  // ----------------------------------------------------------

  // Actual elapsed running/session time entered at completion.
  durationMinutes?: number;

  // Optional so time-based runs can still be recorded when
  // distance is unavailable or not useful.
  distanceMiles?: number;

  // ----------------------------------------------------------
  // Perceived Effort
  // ----------------------------------------------------------

  // User-reported session effort on a 1–10 RPE scale.
  //
  // Optional so older run history remains backwards compatible.
  rpe?: number;

  // ----------------------------------------------------------
  // Prescription Snapshot
  // ----------------------------------------------------------

  // Capture the prescribed intensity when the run begins so
  // historical sessions remain meaningful if the training
  // plan changes later.
  intensity?: CardioIntensity;

  // Snapshot of the scheduled run prescription when this
  // session begins.
  //
  // These remain optional because manually started runs and
  // older run history may not have a prescription.
  prescribedLabel?: string;

  prescribedDurationMin?: number;
  prescribedDurationMax?: number;

  prescribedRunIntervalMinutes?: number;
  prescribedWalkIntervalMinutes?: number;

  prescribedNote?: string;

  // ----------------------------------------------------------
  // Notes
  // ----------------------------------------------------------

  notes?: string;

  // ----------------------------------------------------------
  // Scheduled Training Context
  // ----------------------------------------------------------

  // Workouts launched from Today carry the exact scheduled
  // activity that they belong to.
  //
  // Manually started runs leave these undefined.
  scheduledActivityId?: string;

  scheduledDate?: string;
}


// ============================================================
// Exercise Categories
// ============================================================

export type ExerciseCategory =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Arms"
  | "Legs"
  | "Core";


// ============================================================
// Legacy Exercise Progression
// ============================================================

// This is retained temporarily for backwards compatibility.
//
// New progression behavior should be determined primarily by
// resistanceType + performanceType.
export type ExerciseProgressionType =
  | "Load"
  | "Reps"
  | "Assistance"
  | "Duration";


// ============================================================
// Exercise Metrics
// ============================================================

// Describes what kind of resistance is being recorded.
//
// None:
// Bodyweight or movements without external resistance.
//
// Weight:
// External resistance that makes the exercise harder.
//
// Assistance:
// External assistance that makes the exercise easier.
export type ExerciseResistanceType =
  | "None"
  | "Weight"
  | "Assistance";


// Describes what the working-set performance value means.
//
// Reps:
// ExerciseSet.reps represents repetitions.
//
// Duration:
// ExerciseSet.reps temporarily represents seconds until
// ExerciseSet receives a dedicated duration field.
export type ExercisePerformanceType =
  | "Reps"
  | "Duration";


// ============================================================
// Exercise Definition
// ============================================================

export interface ExerciseDefinition {
  id: string;
  name: string;
  category: ExerciseCategory;

  // ----------------------------------------------------------
  // Programming
  // ----------------------------------------------------------

  // Default number of working sets.
  sets?: number;

  // Target performance range.
  //
  // Repetition exercises:
  // repMin / repMax represent repetitions.
  //
  // Duration exercises:
  // repMin / repMax currently represent seconds.
  repMin?: number;
  repMax?: number;

  // Amount to change resistance when progression occurs.
  //
  // Examples:
  //
  // Chest Press Machine:
  // 5 lb
  //
  // Leg Press:
  // 10 lb
  //
  // Assisted Pull-Up:
  // reduce assistance by 5 lb
  //
  // Bodyweight movements:
  // 0
  increment?: number;

  // ----------------------------------------------------------
  // Legacy Progression Model
  // ----------------------------------------------------------

  // Retained temporarily while the rest of Fitness OS
  // migrates to resistanceType + performanceType.
  progressionType?: ExerciseProgressionType;

  // ----------------------------------------------------------
  // Exercise Metrics
  // ----------------------------------------------------------

  // Describes whether the exercise uses external resistance,
  // assistance, or neither.
  resistanceType?: ExerciseResistanceType;

  // Describes whether performance is measured by repetitions
  // or duration.
  performanceType?: ExercisePerformanceType;

  // ----------------------------------------------------------
  // Exercise Progression Path
  // ----------------------------------------------------------

  // Permanent Exercise Library ID of the harder variation
  // recommended after this exercise has been mastered.
  //
  // Example:
  //
  // Push-Ups
  //   ↓
  // Feet-Elevated Push-Ups
  //   ↓
  // Weighted Push-Ups
  //
  // The final exercise in a progression chain can omit this.
  nextVariationId?: string;

  // ----------------------------------------------------------
  // Custom Exercise
  // ----------------------------------------------------------

  // Built-in exercises omit this property.
  // User-created exercises set it to true.
  custom?: boolean;
}


// ============================================================
// Training Plan
// ============================================================

// Describes the major kind of activity prescribed by the
// weekly training plan.
//
// This is intentionally separate from WorkoutType.
//
// WorkoutType describes a recorded workout session.
// TrainingActivityType describes something the training plan
// can prescribe for a day.
export type TrainingActivityType =
  | "Strength"
  | "Run"
  | "Aerial"
  | "Walk"
  | "Mobility"
  | "Recovery"
  | "Rest";


// ============================================================
// Cardio Intensity
// ============================================================

export type CardioIntensity =
  | "Easy"
  | "Zone 2"
  | "Intervals"
  | "Adaptive";


// ============================================================
// Training Activity
// ============================================================

export interface TrainingActivity {
  id: string;

  type: TrainingActivityType;

  // Human-readable label shown in the UI.
  //
  // Examples:
  // "Gym A"
  // "Easy Run"
  // "Long Walk"
  // "Aerial"
  label: string;

  // ----------------------------------------------------------
  // Strength
  // ----------------------------------------------------------

  // Used when type === "Strength".
  //
  // This points to one of the active Gym A/B/C templates.
  strengthWorkout?: StrengthWorkoutType;

  // ----------------------------------------------------------
  // Cardio / Walking
  // ----------------------------------------------------------

  cardioIntensity?: CardioIntensity;

  // Duration prescription.
  //
  // A range lets us represent spreadsheet prescriptions such
  // as Zone 2 for 15–20 minutes.
  durationMin?: number;
  durationMax?: number;

  // ----------------------------------------------------------
  // Running Intervals
  // ----------------------------------------------------------

  // Used for prescriptions such as:
  //
  // Run 3 min / Walk 2 min × 25 min
  runIntervalMinutes?: number;
  walkIntervalMinutes?: number;

  // ----------------------------------------------------------
  // Schedule Behavior
  // ----------------------------------------------------------

  // Optional activities can be skipped without treating the
  // day's required training as missed.
  optional?: boolean;

  // Some activities can replace another scheduled activity.
  //
  // Example:
  // Aerial may replace an easy run during appropriate weeks.
  substitutionGroup?: string;

  // Additional programming guidance that doesn't warrant its
  // own structured field yet.
  note?: string;
}


// ============================================================
// Training Day
// ============================================================

export type TrainingDayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";


export interface TrainingDay {
  day: TrainingDayOfWeek;

  // A day can contain multiple prescriptions.
  //
  // Example:
  //
  // Monday:
  //   Gym A
  //   Zone 2
  activities: TrainingActivity[];
}


// ============================================================
// Training Week Type
// ============================================================

// Describes how a training week behaves in the long-term
// progression model.
//
// Ramp:
// Initial return/build weeks before steady state.
//
// SteadyState:
// Normal long-term training after the ramp is complete.
//
// Deload:
// Reduced-fatigue training week inserted periodically during
// steady-state training.
export type TrainingWeekType =
  | "Ramp"
  | "SteadyState"
  | "Deload";


// ============================================================
// Training Week
// ============================================================

export interface TrainingWeek {
  // Stable identifier used internally.
  //
  // Examples:
  // "week-0"
  // "week-4"
  // "steady-state"
  // "deload"
  id: string;

  // Week number in the progression.
  //
  // Week 7 represents the steady-state program rather than
  // requiring Week 8, Week 9, etc. to be duplicated.
  //
  // A reusable deload template can also use Week 7 because it
  // belongs to the steady-state phase rather than extending
  // the linear ramp.
  weekNumber: number;

  // Human-readable phase name.
  //
  // Examples:
  // "Return"
  // "Restart"
  // "Consistency"
  // "Steady State"
  // "Deload"
  name: string;

  // Explicit behavior used by the progression engine.
  //
  // This avoids inferring program behavior from human-readable
  // names such as "Steady State" or "Deload".
  weekType: TrainingWeekType;

  // Short explanation that can eventually appear on Today.
  description?: string;

  days: TrainingDay[];

  // The steady-state template repeats indefinitely until a
  // deload or future program phase temporarily replaces it.
  repeating?: boolean;
}


// ============================================================
// Training Plan
// ============================================================

export interface TrainingPlan {
  id: string;
  name: string;

  weeks: TrainingWeek[];
}


// ============================================================
// Training Plan State
// ============================================================

export interface TrainingPlanState {
  // ID of the TrainingPlan this state belongs to.
  trainingPlanId: string;

  // Local calendar date on which Week 0 begins.
  startDate: string;

  // Calendar weeks that were intentionally repeated because
  // adherence was too low to advance.
  //
  // Each entry is the Monday on which the REPEATED week began.
  //
  // Example:
  //
  // Week 2 scheduled:
  // 2026-08-17
  //
  // Week 2 fails progression.
  //
  // Repeated Week 2 begins:
  // 2026-08-24
  //
  // heldWeekStartDates:
  // ["2026-08-24"]
  //
  // Every hold effectively shifts all future program weeks
  // backward by one week.
  heldWeekStartDates?: string[];

  // Calendar weeks whose progression decision has already
  // been evaluated.
  //
  // Each value is the Monday start date of the week that was
  // evaluated.
  //
  // This prevents the same completed week from being
  // processed more than once.
  evaluatedWeekStartDates?: string[];

  // Number of successfully progressed steady-state weeks
  // completed since the most recent deload.
  //
  // Held/repeated steady-state weeks do not increment this.
  //
  // After 7 successfully progressed steady-state weeks, the
  // following calendar week becomes a deload.
  successfulSteadyStateWeeks?: number;

  // Calendar Monday dates that should use the reusable deload
  // template.
  //
  // Persisting the actual dates makes deload scheduling
  // deterministic even after the app is closed/reopened.
  deloadWeekStartDates?: string[];
}


// ============================================================
// Training Activity Completion
// ============================================================
//
// Records completion of an activity prescribed by the
// training plan.
//
// This is intentionally separate from WorkoutSession.
//
// WorkoutSession stores detailed strength-workout performance
// such as exercises, sets, reps, and resistance.
//
// TrainingActivityCompletion answers the simpler scheduling
// question:
//
// "Was this scheduled activity completed?"
//
// ============================================================

export interface TrainingActivityCompletion {
  id: string;

  // Local calendar date on which the activity was completed.
  //
  // Stored as YYYY-MM-DD so it can be compared directly with
  // the training schedule without timezone shifting.
  date: string;

  // ID of the TrainingActivity from the scheduled TrainingDay.
  //
  // Example:
  // "week-0-monday-gym-a"
  trainingActivityId: string;

  // Snapshot of the activity type at the time it was completed.
  //
  // Keeping this here makes completion history easier to
  // inspect even if the training plan later changes.
  type: TrainingActivityType;

  // Human-readable activity label at the time of completion.
  //
  // Examples:
  // "Gym A"
  // "Easy Run"
  // "Aerial"
  label: string;

  // Exact completion timestamp.
  completedAt: string;

  // Strength activities can point back to the detailed
  // WorkoutSession that produced this completion.
  //
  // Other activity types can leave this undefined.
  workoutSessionId?: string;
}