// ============================================================
// Workout Sets
// ============================================================

export interface ExerciseSet {
  id: string;
  weight: number;
  reps: number;
  completed: boolean;

  // Optional rate of perceived exertion on a 1–10 scale.
  // Older saved sets do not contain this field.
  rpe?: number;
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

  // Optional exercise-specific preparation. Kept outside `sets` so ramp-up
  // work never enters prescribed working-set completion or analysis.
  rampUpSets?: ExerciseSet[];

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
  | "HipExtension"
  | "KneeFlexion"
  | "HipHinge"
  | "HorizontalPush"
  | "HorizontalPull"
  | "VerticalPush"
  | "VerticalPull"
  | "HipStability"
  | "Adduction"
  | "CoreRotation"
  | "CoreFlexion"
  | "CoreStability"
  | "CoreHipFlexion"
  | "ChestIsolation"
  | "ShoulderAbduction"
  | "RearShoulder"
  | "ElbowFlexion"
  | "ElbowExtension"
  | "CalfRaise";


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
  | "Barbell"
  | "BarbellRack"
  | "WeightPlate"
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

  // Session preparation is recorded separately from ExerciseSet so it cannot
  // affect working-set completion, volume, PRs, or progression decisions.
  warmupCompletedAt?: string;
  warmupSkippedAt?: string;

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

  prescribedRunProgressionRole?:
    RunProgressionRole;

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
// Conventional external load recorded numerically in pounds.
//
// Assistance:
// External assistance recorded numerically in pounds.
//
// Band:
// Resistance-band loading. Band resistance is not treated as
// equivalent to a conventional pound-based external load.
export type ExerciseResistanceType =
  | "None"
  | "Weight"
  | "Assistance"
  | "Band";


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
// Exercise Rep Counting
// ============================================================
//
// Total:
// ExerciseSet.reps represents the total repetitions performed.
//
// PerSide:
// ExerciseSet.reps represents repetitions performed on EACH side.
// This changes how the prescription is displayed/interpreted without
// changing the stored ExerciseSet.reps value.
//
// Undefined on older/custom definitions defaults to Total.
// ============================================================

export type ExerciseRepCounting =
  | "Total"
  | "PerSide";


// ============================================================
// Exercise Definition
// ============================================================

export interface ExerciseDefinition {
  id: string;
  name: string;
  category: ExerciseCategory;

  // ----------------------------------------------------------
  // Training Intent / Availability
  // ----------------------------------------------------------

  // Movement role(s) this exercise can fulfill.
  movementRoles?: StrengthMovementRole[];

  // Equipment/setup needed to perform this exercise.
  requiredEquipment?: WorkoutEquipment[];
  requiredCapabilities?: WorkoutSetupCapability[];

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

  // Describes how repetition prescriptions should be interpreted.
  //
  // PerSide means a stored value of 10 represents 10 repetitions
  // on each side, not 10 total alternating repetitions.
  //
  // Omitted defaults to Total for backwards compatibility.
  repCounting?: ExerciseRepCounting;

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

export type TrainingModality =
  | "Strength"
  | "Run"
  | "Aerial";

export type AerialSessionType =
  | "Class"
  | "OpenStudio";

export type TrainingPreferenceConstraint =
  | "Fixed"
  | "Flexible";

export interface AerialSessionPreference {
  id: string;
  day: TrainingDayOfWeek;
  sessionType: AerialSessionType;
  name?: string;
  constraint: TrainingPreferenceConstraint;
}

export type RunningEnvironmentPreference =
  | "Either"
  | "Outdoor"
  | "Treadmill";

export type RunningFormatPreference =
  | "Either"
  | "RunWalk"
  | "Continuous";

export interface RunningPreference {
  environment: RunningEnvironmentPreference;
  format: RunningFormatPreference;
}

export type WorkoutEnvironment =
  | "Home"
  | "Gym";

export interface TrainingEquipmentProfile {
  equipment: WorkoutEquipment[];
  capabilities: WorkoutSetupCapability[];
}

export interface TrainingSessionDurationPreference {
  typicalMinutes?: number;
  maximumMinutes?: number;
}

export interface TrainingParticipationPreference {
  effectiveDate: string;
  enabledModalities: TrainingModality[];
  // Soft planning signals. These do not move an existing scheduled activity;
  // schedule construction and adaptive planning may use them when choosing
  // among otherwise valid days.
  preferredDaysByModality?: Partial<
    Record<TrainingModality, TrainingDayOfWeek[]>
  >;
  aerialSessions?: AerialSessionPreference[];
  runningPreference?: RunningPreference;
  equipmentProfiles?: Partial<
    Record<WorkoutEnvironment, TrainingEquipmentProfile>
  >;
  sessionDurationByModality?: Partial<
    Record<TrainingModality, TrainingSessionDurationPreference>
  >;
  createdAt: string;
  updatedAt: string;
}


// ============================================================
// Cardio Intensity
// ============================================================

export type CardioIntensity =
  | "Easy"
  | "Zone 2"
  | "Intervals"
  | "Adaptive";


// ============================================================
// Running Progression
// ============================================================

export type RunProgressionRole =
  | "Development"
  | "Endurance";


export interface RunProgressionPrescription {
  role:
    RunProgressionRole;

  label: string;

  intensity:
    CardioIntensity;

  durationMin: number;

  durationMax: number;

  runIntervalMinutes?: number;

  walkIntervalMinutes?: number;

  note?: string;
}


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

  // Optional multiplier applied to the normal working-set
  // prescription when this scheduled strength activity begins.
  //
  // Example:
  //
  // 0.6 = perform approximately 60% of normal working-set volume.
  //
  // Deload weeks use this to reduce fatigue while preserving the
  // normal Gym A / B / C exercise selection and movement patterns.
  //
  // Omitted means use the normal workout-template prescription.
  strengthVolumeMultiplier?: number;

  // ----------------------------------------------------------
  // Cardio / Walking
  // ----------------------------------------------------------

  cardioIntensity?: CardioIntensity;

  // Identifies the long-term running progression track.
  //
  // Development:
  // Shorter run focused on aerobic development and, when
  // appropriate, quality work such as intervals.
  //
  // Endurance:
  // Longer easy session focused primarily on duration.
  runProgressionRole?: RunProgressionRole;

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
// Weekly Progression Decision Record
// ============================================================
//
// Preserves the progression decision that was actually applied
// to a completed calendar week.
//
// The automatic recommendation is retained even if the user
// later overrides it, so progression history remains auditable.

export type WeeklyProgressionDecisionStatus =
  | "Advance"
  | "AdvanceWithWarning"
  | "Hold";


export interface WeeklyProgressionDecisionRecord {
  // Start date of the calendar week that was evaluated.
  weekStartDate: string;

  // Program week type whose progression was evaluated.
  weekType: TrainingWeekType;

  // Automatic recommendation produced by the progression
  // engine before any manual override.
  automaticStatus:
    WeeklyProgressionDecisionStatus;

  automaticShouldAdvance: boolean;

  automaticReason: string;

  automaticFactors: string[];

  // Final result actually applied to the training plan.
  finalShouldAdvance: boolean;

  // True when the user intentionally changed the automatic
  // progression result.
  manuallyOverridden: boolean;

  // Optional explanation supplied with a manual override.
  overrideReason?: string;

  // ISO timestamp recording when the automatic decision was
  // originally applied.
  decidedAt: string;

  // ISO timestamp of the most recent manual override.
  overriddenAt?: string;
}


// ============================================================
// Return to Training
// ============================================================

export type TrainingInterruptionReason =
  | "Illness"
  | "Travel"
  | "Other";


export interface TrainingInterruption {
  // First local calendar date on which normal training was
  // interrupted.
  startedAt: string;

  // First local calendar date on which the user is available
  // to resume training.
  resumedAt: string;

  reason: TrainingInterruptionReason;

  // Ramp week selected as the appropriate re-entry point.
  //
  // 0 = Return
  // 1 = Restart
  // 2 = Consistency
  // 3 = Progress
  // 4 = Add Volume
  // 5 = Build
  // 6 = Transition
  returnRampWeek: number;

  // Start date of the calendar week in which the temporary
  // return-to-training ramp begins.
  returnWeekStartDate: string;
}


// ============================================================
// Activity Rescheduling
// ============================================================
//
// Rescheduling changes when one specific scheduled occurrence
// should be performed without changing the underlying training
// plan template or activity identity.
//
// trainingActivityId + originalDate identifies the occurrence.
//
// Example:
//
// Gym A is normally prescribed:
//   Monday 2026-08-24
//
// User moves it to:
//   Tuesday 2026-08-25
//
// The underlying Monday Gym A TrainingActivity remains unchanged.
// Schedule resolution suppresses that occurrence on Monday and
// exposes the same activity on Tuesday.
// ============================================================

export interface TrainingActivityReschedule {
  // Stable TrainingActivity ID from the underlying plan.
  trainingActivityId: string;

  // Original local calendar date on which this occurrence was
  // prescribed.
  originalDate: string;

  // New local calendar date on which it should be prescribed.
  scheduledDate: string;

  // Exact timestamp recording when the move was made.
  rescheduledAt: string;
}


// ============================================================
// Activity Occurrence Adjustments
// ============================================================
//
// Records an intentional change to one specific scheduled
// occurrence without mutating the underlying training-plan
// template.
//
// trainingActivityId + originalDate identifies the occurrence.
//
// Skip:
// Suppresses that occurrence for the owning calendar week.
//
// Substitute:
// Suppresses that occurrence because another activity in the same
// substitution group is being used instead. The replacement
// activity keeps its own normal occurrence and identity.
//
// These adjustments are intentionally separate from rescheduling:
// rescheduling changes WHEN an occurrence happens, while these
// records change whether an optional occurrence should remain in
// the resolved schedule.
// ============================================================

export type TrainingActivityAdjustmentAction =
  | "Skip"
  | "Substitute";


export interface TrainingActivityAdjustment {
  // Stable TrainingActivity ID from the underlying plan.
  trainingActivityId: string;

  // Original local calendar date on which this occurrence was
  // prescribed. This preserves week ownership even if other
  // schedule overlays move activities around it.
  originalDate: string;

  action:
    TrainingActivityAdjustmentAction;

  // Required for Substitute. This is the stable TrainingActivity
  // ID of the existing peer occurrence that is being used instead.
  //
  // The resolver does not create a duplicate replacement
  // occurrence; it suppresses only the substituted-away activity.
  substituteTrainingActivityId?: string;

  // Exact timestamp recording when the adjustment was made.
  adjustedAt: string;
}


// ============================================================
// Strength Variant Overrides
// ============================================================
//
// Records which strength-workout variant should be used for one
// specific scheduled strength occurrence.
//
// trainingActivityId + originalDate identifies the occurrence.
//
// This is separate from rescheduling and optional adjustments:
// rescheduling changes WHEN an occurrence happens, while a variant
// override changes HOW the scheduled strength session should be
// executed without changing its underlying Gym A / B / C identity.
// ============================================================

export interface TrainingActivityVariantOverride {
  // Stable TrainingActivity ID from the underlying plan.
  trainingActivityId: string;

  // Original local calendar date on which this occurrence was
  // prescribed. This keeps the override attached to the same
  // occurrence even if it is later rescheduled.
  originalDate: string;

  // Stable ID of the StrengthWorkoutVariant to use when this
  // occurrence is started.
  strengthWorkoutVariantId: string;

  // Exact timestamp recording when the override was applied.
  overriddenAt: string;
}


// ============================================================
// Training Plan State
// ============================================================

export interface TrainingPlanState {
  // ID of the TrainingPlan this state belongs to.
  trainingPlanId: string;

  // Local calendar date on which Week 0 begins.
  startDate: string;

  // Effective-dated participation choices preserve historical schedule and
  // adherence interpretation when a modality is enabled or disabled later.
  trainingParticipationPreferences?: TrainingParticipationPreference[];

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
  // Each value is the canonical start date of the week that was
  // evaluated.
  //
  // This prevents the same completed week from being
  // processed more than once.
  evaluatedWeekStartDates?: string[];

  // Persisted history of weekly progression decisions.
  //
  // Optional for backward compatibility with training-plan
  // state saved before decision history was introduced.
  weeklyProgressionDecisions?:
    WeeklyProgressionDecisionRecord[];

  // Current steady-state running prescriptions.
  //
  // Optional for backward compatibility with plans created
  // before adaptive running progression existed.
  runningProgression?: {
    Development?:
      RunProgressionPrescription;

    Endurance?:
      RunProgressionPrescription;
  };

  // Most recent active return-to-training interruption.
  //
  // The return ramp temporarily changes which TrainingWeek is
  // scheduled without changing startDate or deleting historical
  // strength/running progression data.
  //
  // Optional for backward compatibility with existing saved
  // training-plan state.
  trainingInterruption?: TrainingInterruption;

  // User-requested moves of individual scheduled activity
  // occurrences.
  //
  // This is an overlay on the resolved schedule. It does not
  // mutate TrainingPlan templates, progression history, or the
  // identity of the moved TrainingActivity.
  //
  // Optional for backward compatibility with training-plan
  // state saved before activity rescheduling existed.
  activityReschedules?:
    TrainingActivityReschedule[];

  // User-approved Skip/Substitute decisions for individual
  // scheduled activity occurrences.
  //
  // This overlay is separate from activityReschedules because it
  // changes whether an optional occurrence remains scheduled,
  // rather than changing its date.
  //
  // Optional for backward compatibility with saved state created
  // before occurrence adjustments existed.
  activityAdjustments?:
    TrainingActivityAdjustment[];

  // User-approved strength-workout variant choice for individual
  // scheduled strength occurrences.
  //
  // Optional for backward compatibility with saved state created
  // before adaptive strength-variant scheduling existed.
  activityVariantOverrides?:
    TrainingActivityVariantOverride[];

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
