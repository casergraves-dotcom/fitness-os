import type {
  TrainingActivity,
  TrainingDay,
  TrainingDayOfWeek,
  TrainingPlan,
  TrainingWeek,
} from "./types";


// ============================================================
// Helpers
// ============================================================

function activity(
  values: TrainingActivity
): TrainingActivity {
  return values;
}


function day(
  dayOfWeek: TrainingDayOfWeek,
  activities: TrainingActivity[]
): TrainingDay {
  return {
    day: dayOfWeek,
    activities,
  };
}


function week(
  values: TrainingWeek
): TrainingWeek {
  return values;
}


// ============================================================
// Shared Activity Prescriptions
// ============================================================

const EASY_WALK_PRESCRIPTION = {
  cardioIntensity:
    "Easy" as const,

  durationMin:
    20,

  durationMax:
    30,

  note:
    "Walk at a relaxed, conversational pace. This is recovery work, not a pace or distance challenge.",
};


const STRETCH_RECOVERY_PRESCRIPTION = {
  mobilityRoutineId:
    "full-body-recovery" as const,

  durationMin:
    10,

  durationMax:
    15,

  note:
    "Use the guided full-body routine and keep every position gentle and restorative.",
};

const LONG_WALK_PRESCRIPTION = {
  cardioIntensity:
    "Easy" as const,

  durationMin:
    45,

  durationMax:
    60,

  note:
    "Walk at a comfortable conversational pace. The goal is easy aerobic movement, not speed or distance.",
};


const LONG_WALK_HIKE_PRESCRIPTION = {
  cardioIntensity:
    "Easy" as const,

  durationMin:
    60,

  durationMax:
    90,

  note:
    "Choose an easy walk or hike at a sustainable conversational effort. Keep the session aerobic and avoid turning it into a hard conditioning workout.",
};


const RECOVERY_DAY_PRESCRIPTION = {
  note:
    "No structured training is required today. Prioritize recovery, sleep, hydration, and easy movement. A short gentle walk or mobility session is optional if it feels restorative.",
};


// ============================================================
// Week 0
// Return
// ============================================================

const week0 = week({
  id: "week-0",
  weekNumber: 0,
  name: "Return",
  weekType: "Ramp",

  description:
    "Ease back into consistent training with reduced strength volume and low-intensity activity.",

  days: [
    day("Monday", [
      activity({
        id: "week-0-monday-gym-a",
        type: "Strength",
        label: "Gym A",
        strengthWorkout: "Gym A",
        note: "Use 2 working sets per exercise.",
      }),
    ]),

    day("Tuesday", [
      activity({
        id: "week-0-tuesday-walk",
        type: "Walk",
        label: "Easy Walk",
        ...EASY_WALK_PRESCRIPTION,
        optional: true,
      }),

      activity({
        id: "week-0-tuesday-mobility",
        type: "Mobility",
        label: "Stretch & Recovery",
        ...STRETCH_RECOVERY_PRESCRIPTION,
        optional: true,
      }),
    ]),

    day("Wednesday", [
      activity({
        id: "week-0-wednesday-walk",
        type: "Walk",
        label: "Easy Walk",
        ...EASY_WALK_PRESCRIPTION,
      }),
    ]),

    day("Thursday", [
      activity({
        id: "week-0-thursday-aerial",
        type: "Aerial",
        label: "Aerial",
        optional: true,
      }),
    ]),

    day("Friday", [
      activity({
        id: "week-0-friday-gym-b",
        type: "Strength",
        label: "Gym B",
        strengthWorkout: "Gym B",
        note: "Use 2 working sets per exercise.",
      }),
    ]),

    day("Saturday", [
      activity({
        id: "week-0-saturday-walk",
        type: "Walk",
        label: "Long Walk",
        ...LONG_WALK_PRESCRIPTION,
      }),
    ]),

    day("Sunday", [
      activity({
        id: "week-0-sunday-recovery",
        type: "Recovery",
        label: "Recovery",
        ...RECOVERY_DAY_PRESCRIPTION,
      }),
    ]),
  ],
});


// ============================================================
// Week 1
// Restart
// ============================================================

const week1 = week({
  id: "week-1",
  weekNumber: 1,
  name: "Restart",
  weekType: "Ramp",

  description:
    "Re-establish the weekly training rhythm while gradually restoring strength and running volume.",

  days: [
    day("Monday", [
      activity({
        id: "week-1-monday-gym-a",
        type: "Strength",
        label: "Gym A",
        strengthWorkout: "Gym A",
        note: "Use 2–3 working sets per exercise.",
      }),
    ]),

    day("Tuesday", [
      activity({
        id: "week-1-tuesday-aerial",
        type: "Aerial",
        label: "Aerial",
        optional: true,
      }),

      activity({
        id: "week-1-tuesday-rest",
        type: "Rest",
        label: "Rest",
        optional: true,
      }),
    ]),

    day("Wednesday", [
      activity({
        id: "week-1-wednesday-run",
        type: "Run",
        label: "Run / Walk",
        cardioIntensity: "Easy",
        durationMin: 20,
        durationMax: 20,
        runIntervalMinutes: 2,
        walkIntervalMinutes: 2,
      }),
    ]),

    day("Thursday", [
      activity({
        id: "week-1-thursday-walk",
        type: "Walk",
        label: "Easy Walk",
        ...EASY_WALK_PRESCRIPTION,
        optional: true,
      }),

      activity({
        id: "week-1-thursday-mobility",
        type: "Mobility",
        label: "Stretch & Recovery",
        ...STRETCH_RECOVERY_PRESCRIPTION,
        optional: true,
      }),
    ]),

    day("Friday", [
      activity({
        id: "week-1-friday-gym-b",
        type: "Strength",
        label: "Gym B",
        strengthWorkout: "Gym B",
        note: "Use 2–3 working sets per exercise.",
      }),
    ]),

    day("Saturday", [
      activity({
        id: "week-1-saturday-walk",
        type: "Walk",
        label: "Long Walk",
        ...LONG_WALK_PRESCRIPTION,
      }),
    ]),

    day("Sunday", [
      activity({
        id: "week-1-sunday-recovery",
        type: "Recovery",
        label: "Recovery",
        ...RECOVERY_DAY_PRESCRIPTION,
      }),
    ]),
  ],
});


// ============================================================
// Week 2
// Consistency
// ============================================================

const week2 = week({
  id: "week-2",
  weekNumber: 2,
  name: "Consistency",
  weekType: "Ramp",

  description:
    "Restore normal working-set volume while continuing gradual run/walk progression.",

  days: [
    day("Monday", [
      activity({
        id: "week-2-monday-gym-a",
        type: "Strength",
        label: "Gym A",
        strengthWorkout: "Gym A",
        note: "Use 3 working sets where prescribed.",
      }),
    ]),

    day("Tuesday", [
      activity({
        id: "week-2-tuesday-aerial",
        type: "Aerial",
        label: "Aerial",
        optional: true,
      }),

      activity({
        id: "week-2-tuesday-rest",
        type: "Rest",
        label: "Rest",
        optional: true,
      }),
    ]),

    day("Wednesday", [
      activity({
        id: "week-2-wednesday-run",
        type: "Run",
        label: "Run / Walk",
        cardioIntensity: "Easy",
        durationMin: 25,
        durationMax: 25,
        runIntervalMinutes: 3,
        walkIntervalMinutes: 2,
      }),
    ]),

    day("Thursday", [
      activity({
        id: "week-2-thursday-walk",
        type: "Walk",
        label: "Easy Walk",
        ...EASY_WALK_PRESCRIPTION,
        optional: true,
      }),

      activity({
        id: "week-2-thursday-mobility",
        type: "Mobility",
        label: "Stretch & Recovery",
        ...STRETCH_RECOVERY_PRESCRIPTION,
        optional: true,
      }),
    ]),

    day("Friday", [
      activity({
        id: "week-2-friday-gym-b",
        type: "Strength",
        label: "Gym B",
        strengthWorkout: "Gym B",
        note: "Use 3 working sets where prescribed.",
      }),
    ]),

    day("Saturday", [
      activity({
        id: "week-2-saturday-walk",
        type: "Walk",
        label: "Long Walk / Hike",
        ...LONG_WALK_HIKE_PRESCRIPTION,
      }),
    ]),

    day("Sunday", [
      activity({
        id: "week-2-sunday-recovery",
        type: "Recovery",
        label: "Recovery",
        ...RECOVERY_DAY_PRESCRIPTION,
      }),
    ]),
  ],
});


// ============================================================
// Week 3
// Progress
// ============================================================

const week3 = week({
  id: "week-3",
  weekNumber: 3,
  name: "Progress",
  weekType: "Ramp",

  description:
    "Maintain full strength volume and extend the continuous training demand of the run/walk session.",

  days: [
    day("Monday", [
      activity({
        id: "week-3-monday-gym-a",
        type: "Strength",
        label: "Gym A",
        strengthWorkout: "Gym A",
      }),
    ]),

    day("Tuesday", [
      activity({
        id: "week-3-tuesday-aerial",
        type: "Aerial",
        label: "Aerial",
        optional: true,
      }),

      activity({
        id: "week-3-tuesday-rest",
        type: "Rest",
        label: "Rest",
        optional: true,
      }),
    ]),

    day("Wednesday", [
      activity({
        id: "week-3-wednesday-run",
        type: "Run",
        label: "Run / Walk",
        cardioIntensity: "Easy",
        durationMin: 30,
        durationMax: 30,
        runIntervalMinutes: 5,
        walkIntervalMinutes: 2,
      }),
    ]),

    day("Thursday", [
      activity({
        id: "week-3-thursday-walk",
        type: "Walk",
        label: "Easy Walk",
        ...EASY_WALK_PRESCRIPTION,
        optional: true,
      }),

      activity({
        id: "week-3-thursday-mobility",
        type: "Mobility",
        label: "Stretch & Recovery",
        ...STRETCH_RECOVERY_PRESCRIPTION,
        optional: true,
      }),
    ]),

    day("Friday", [
      activity({
        id: "week-3-friday-gym-b",
        type: "Strength",
        label: "Gym B",
        strengthWorkout: "Gym B",
      }),
    ]),

    day("Saturday", [
      activity({
        id: "week-3-saturday-walk",
        type: "Walk",
        label: "Long Walk / Hike",
        ...LONG_WALK_HIKE_PRESCRIPTION,
      }),
    ]),

    day("Sunday", [
      activity({
        id: "week-3-sunday-recovery",
        type: "Recovery",
        label: "Recovery",
        ...RECOVERY_DAY_PRESCRIPTION,
      }),
    ]),
  ],
});


// ============================================================
// Week 4
// Add Volume
// ============================================================

const week4 = week({
  id: "week-4",
  weekNumber: 4,
  name: "Add Volume",
  weekType: "Ramp",

  description:
    "Introduce the third full-body strength day and transition toward the long-term weekly structure.",

  days: [
    day("Monday", [
      activity({
        id: "week-4-monday-gym-a",
        type: "Strength",
        label: "Gym A",
        strengthWorkout: "Gym A",
      }),
    ]),

    day("Tuesday", [
      activity({
        id: "week-4-tuesday-aerial",
        type: "Aerial",
        label: "Aerial",
        optional: true,
        substitutionGroup: "easy-cardio",
      }),

      activity({
        id: "week-4-tuesday-walk",
        type: "Walk",
        label: "Easy Walk",
        ...EASY_WALK_PRESCRIPTION,
        optional: true,
        substitutionGroup: "easy-cardio",
      }),
    ]),

    day("Wednesday", [
      activity({
        id: "week-4-wednesday-gym-b",
        type: "Strength",
        label: "Gym B",
        strengthWorkout: "Gym B",
      }),
    ]),

    day("Thursday", [
      activity({
        id: "week-4-thursday-run",
        type: "Run",
        label: "Easy Run",
        cardioIntensity: "Easy",
        durationMin: 25,
        durationMax: 25,
      }),
    ]),

    day("Friday", [
      activity({
        id: "week-4-friday-gym-c",
        type: "Strength",
        label: "Gym C",
        strengthWorkout: "Gym C",
      }),
    ]),

    day("Saturday", [
      activity({
        id: "week-4-saturday-walk",
        type: "Walk",
        label: "Long Walk",
        ...LONG_WALK_PRESCRIPTION,
      }),
    ]),

    day("Sunday", [
      activity({
        id: "week-4-sunday-recovery",
        type: "Recovery",
        label: "Recovery",
        ...RECOVERY_DAY_PRESCRIPTION,
      }),
    ]),
  ],
});


// ============================================================
// Week 5
// Build
// ============================================================

const week5 = week({
  id: "week-5",
  weekNumber: 5,
  name: "Build",
  weekType: "Ramp",

  description:
    "Maintain three full-body strength sessions and build sustainable aerobic volume.",

  days: [
    day("Monday", [
      activity({
        id: "week-5-monday-gym-a",
        type: "Strength",
        label: "Gym A",
        strengthWorkout: "Gym A",
      }),
    ]),

    day("Tuesday", [
      activity({
        id: "week-5-tuesday-aerial",
        type: "Aerial",
        label: "Aerial",
        optional: true,
        substitutionGroup: "easy-cardio",
      }),

      activity({
        id: "week-5-tuesday-run",
        type: "Run",
        label: "Easy Run",
        cardioIntensity: "Easy",
        optional: true,
        substitutionGroup: "easy-cardio",
      }),
    ]),

    day("Wednesday", [
      activity({
        id: "week-5-wednesday-gym-b",
        type: "Strength",
        label: "Gym B",
        strengthWorkout: "Gym B",
      }),
    ]),

    day("Thursday", [
      activity({
        id: "week-5-thursday-walk",
        type: "Walk",
        label: "Easy Walk",
        ...EASY_WALK_PRESCRIPTION,
        optional: true,
      }),

      activity({
        id: "week-5-thursday-mobility",
        type: "Mobility",
        label: "Stretch & Recovery",
        ...STRETCH_RECOVERY_PRESCRIPTION,
        optional: true,
      }),
    ]),

    day("Friday", [
      activity({
        id: "week-5-friday-gym-c",
        type: "Strength",
        label: "Gym C",
        strengthWorkout: "Gym C",
      }),
    ]),

    day("Saturday", [
      activity({
        id: "week-5-saturday-run",
        type: "Run",
        label: "Easy Run",
        cardioIntensity: "Easy",
        durationMin: 30,
        durationMax: 30,
      }),
    ]),

    day("Sunday", [
      activity({
        id: "week-5-sunday-recovery",
        type: "Recovery",
        label: "Recovery",
        ...RECOVERY_DAY_PRESCRIPTION,
      }),
    ]),
  ],
});


// ============================================================
// Week 6
// Transition
// ============================================================

const week6 = week({
  id: "week-6",
  weekNumber: 6,
  name: "Transition",
  weekType: "Ramp",

  description:
    "Transition into the long-term combination of strength, aerial, running, and recovery.",

  days: [
    day("Monday", [
      activity({
        id: "week-6-monday-gym-a",
        type: "Strength",
        label: "Gym A",
        strengthWorkout: "Gym A",
      }),
    ]),

    day("Tuesday", [
      activity({
        id: "week-6-tuesday-aerial",
        type: "Aerial",
        label: "Aerial",
        optional: true,
        substitutionGroup: "easy-cardio",
      }),

      activity({
        id: "week-6-tuesday-run",
        type: "Run",
        label: "Easy Run",
        cardioIntensity: "Easy",
        optional: true,
        substitutionGroup: "easy-cardio",
      }),
    ]),

    day("Wednesday", [
      activity({
        id: "week-6-wednesday-gym-b",
        type: "Strength",
        label: "Gym B",
        strengthWorkout: "Gym B",
      }),
    ]),

    day("Thursday", [
      activity({
        id: "week-6-thursday-aerial",
        type: "Aerial",
        label: "Aerial",
        optional: true,
        substitutionGroup: "recovery-activity",
      }),

      activity({
        id: "week-6-thursday-walk",
        type: "Walk",
        label: "Easy Walk",
        ...EASY_WALK_PRESCRIPTION,
        optional: true,
        substitutionGroup: "recovery-activity",
      }),
    ]),

    day("Friday", [
      activity({
        id: "week-6-friday-gym-c",
        type: "Strength",
        label: "Gym C",
        strengthWorkout: "Gym C",
      }),
    ]),

    day("Saturday", [
      activity({
        id: "week-6-saturday-run",
        type: "Run",
        label: "Easy Run",
        cardioIntensity: "Easy",
        durationMin: 35,
        durationMax: 35,
      }),
    ]),

    day("Sunday", [
      activity({
        id: "week-6-sunday-recovery",
        type: "Recovery",
        label: "Recovery",
        ...RECOVERY_DAY_PRESCRIPTION,
      }),
    ]),
  ],
});


// ============================================================
// Week 7+
// Steady State
// ============================================================

const steadyState = week({
  id: "steady-state",
  weekNumber: 7,
  name: "Steady State",
  weekType: "SteadyState",

  description:
    "Long-term training structure balancing full-body strength, aerial, aerobic work, adaptive intensity, and recovery.",

  repeating: true,

  days: [
    // --------------------------------------------------------
    // Monday
    // Gym A + Incline Treadmill
    // --------------------------------------------------------

    day("Monday", [
      activity({
        id: "steady-monday-gym-a",
        type: "Strength",
        label: "Gym A",
        strengthWorkout: "Gym A",
      }),

      activity({
        id: "steady-monday-zone-2",
        type: "Walk",
        label: "Incline Treadmill",
        cardioIntensity: "Zone 2",
        durationMin: 15,
        durationMax: 20,

        note:
          "Incline treadmill walk at a sustainable Zone 2 effort.",
      }),
    ]),

    // --------------------------------------------------------
    // Tuesday
    // Aerial OR Easy Run
    // --------------------------------------------------------

    day("Tuesday", [
      activity({
        id: "steady-tuesday-aerial",
        type: "Aerial",
        label: "Aerial",
        optional: true,
        substitutionGroup: "easy-cardio",
      }),

      activity({
        id: "steady-tuesday-run",
        type: "Run",
        label: "Easy Run",
        cardioIntensity: "Easy",
        durationMin: 30,
        durationMax: 30,
        optional: true,
        substitutionGroup: "easy-cardio",

        runProgressionRole:
          "Development",
      }),
    ]),

    // --------------------------------------------------------
    // Wednesday
    // Gym B + Incline Treadmill
    // --------------------------------------------------------

    day("Wednesday", [
      activity({
        id: "steady-wednesday-gym-b",
        type: "Strength",
        label: "Gym B",
        strengthWorkout: "Gym B",
      }),

      activity({
        id: "steady-wednesday-zone-2",
        type: "Walk",
        label: "Incline Treadmill",
        cardioIntensity: "Zone 2",
        durationMin: 15,
        durationMax: 20,

        note:
          "Incline treadmill walk at a sustainable Zone 2 effort.",
      }),
    ]),

    // --------------------------------------------------------
    // Thursday
    // Aerial OR Recovery Walk
    // --------------------------------------------------------

    day("Thursday", [
      activity({
        id: "steady-thursday-aerial",
        type: "Aerial",
        label: "Aerial",
        optional: true,
        substitutionGroup: "recovery-activity",
      }),

      activity({
        id: "steady-thursday-walk",
        type: "Walk",
        label: "Recovery Walk",
        cardioIntensity: "Easy",
        optional: true,
        substitutionGroup: "recovery-activity",
      }),
    ]),

    // --------------------------------------------------------
    // Friday
    // Gym C
    // --------------------------------------------------------

    day("Friday", [
      activity({
        id: "steady-friday-gym-c",
        type: "Strength",
        label: "Gym C",
        strengthWorkout: "Gym C",
      }),

    ]),

    // --------------------------------------------------------
    // Saturday
    // Long Run / Hike
    // --------------------------------------------------------

    day("Saturday", [
      activity({
        id: "steady-saturday-endurance",
        type: "Run",
        label: "Long Run / Hike",
        cardioIntensity: "Easy",
        durationMin: 40,
        durationMax: 40,

        runProgressionRole:
          "Endurance",

        note:
          "Use a long run, hike, or comparable aerobic session based on current goals and recovery.",
      }),
    ]),

    // --------------------------------------------------------
    // Sunday
    // Recovery
    // --------------------------------------------------------

    day("Sunday", [
      activity({
        id: "steady-sunday-recovery",
        type: "Recovery",
        label: "Recovery",
        ...RECOVERY_DAY_PRESCRIPTION,
      }),
    ]),
  ],
});


// ============================================================
// Deload
// Reusable Steady-State Recovery Week
// ============================================================
//
// This template is NOT part of the linear Week 0 → Week 7
// progression. The schedule engine inserts it after seven
// successfully progressed steady-state weeks.
//
// Strength intent:
// Reduce total lifting volume by approximately 40% while
// keeping the normal Gym A / B / C movement patterns.
//
// Cardio intent:
// Keep aerobic work easy. No hard intervals are prescribed.
// ============================================================

export const deloadWeek = week({
  id: "deload",
  weekNumber: 7,
  name: "Deload",
  weekType: "Deload",

  description:
    "Reduce fatigue while maintaining movement quality. Keep strength volume about 40% lower, use comfortable loads, and keep cardio easy.",

  days: [
    // --------------------------------------------------------
    // Monday
    // Gym A + Short Easy Zone 2
    // --------------------------------------------------------

    day("Monday", [
      activity({
        id: "deload-monday-gym-a",
        type: "Strength",
        label: "Gym A",
        strengthWorkout: "Gym A",
        strengthVolumeMultiplier: 0.6,
        note:
          "Deload: reduce normal working-set volume by about 40%. Keep loads comfortable and stop well short of failure.",
      }),

      activity({
        id: "deload-monday-zone-2",
        type: "Walk",
        label: "Incline Treadmill",
        cardioIntensity: "Zone 2",
        durationMin: 10,
        durationMax: 15,
        optional: true,

        note:
          "Short incline treadmill walk at an easy, sustainable Zone 2 effort.",
      }),
    ]),

    // --------------------------------------------------------
    // Tuesday
    // Optional Aerial OR Recovery Walk
    // --------------------------------------------------------

    day("Tuesday", [
      activity({
        id: "deload-tuesday-aerial",
        type: "Aerial",
        label: "Easy Aerial / Technique",
        optional: true,
        substitutionGroup: "deload-tuesday-recovery",
        note:
          "Keep the session technique-focused and avoid high-effort attempts.",
      }),

      activity({
        id: "deload-tuesday-walk",
        type: "Walk",
        label: "Recovery Walk",
        cardioIntensity: "Easy",
        durationMin: 20,
        durationMax: 30,
        optional: true,
        substitutionGroup: "deload-tuesday-recovery",
      }),
    ]),

    // --------------------------------------------------------
    // Wednesday
    // Gym B + Short Easy Zone 2
    // --------------------------------------------------------

    day("Wednesday", [
      activity({
        id: "deload-wednesday-gym-b",
        type: "Strength",
        label: "Gym B",
        strengthWorkout: "Gym B",
        strengthVolumeMultiplier: 0.6,
        note:
          "Deload: reduce normal working-set volume by about 40%. Keep loads comfortable and stop well short of failure.",
      }),

      activity({
        id: "deload-wednesday-zone-2",
        type: "Walk",
        label: "Incline Treadmill",
        cardioIntensity: "Zone 2",
        durationMin: 10,
        durationMax: 15,
        optional: true,

        note:
          "Short incline treadmill walk at an easy, sustainable Zone 2 effort.",
      }),
    ]),

    // --------------------------------------------------------
    // Thursday
    // Recovery / Optional Aerial
    // --------------------------------------------------------

    day("Thursday", [
      activity({
        id: "deload-thursday-aerial",
        type: "Aerial",
        label: "Easy Aerial / Technique",
        optional: true,
        substitutionGroup: "deload-thursday-recovery",
        note:
          "Keep the session technique-focused and avoid high-effort attempts.",
      }),

      activity({
        id: "deload-thursday-walk",
        type: "Walk",
        label: "Recovery Walk",
        cardioIntensity: "Easy",
        durationMin: 20,
        durationMax: 30,
        optional: true,
        substitutionGroup: "deload-thursday-recovery",
      }),
    ]),

    // --------------------------------------------------------
    // Friday
    // Gym C
    // --------------------------------------------------------

    day("Friday", [
      activity({
        id: "deload-friday-gym-c",
        type: "Strength",
        label: "Gym C",
        strengthWorkout: "Gym C",
        strengthVolumeMultiplier: 0.6,
        note:
          "Deload: reduce normal working-set volume by about 40%. Keep loads comfortable and stop well short of failure.",
      }),
    ]),

    // --------------------------------------------------------
    // Saturday
    // Easy Aerobic / Walk / Hike
    // --------------------------------------------------------

    day("Saturday", [
      activity({
        id: "deload-saturday-aerobic",
        type: "Walk",
        label: "Easy Walk / Hike",
        cardioIntensity: "Easy",
        durationMin: 30,
        durationMax: 45,
        optional: true,
        note:
          "Keep the effort conversational. The goal is recovery, not endurance progression.",
      }),
    ]),

    // --------------------------------------------------------
    // Sunday
    // Recovery
    // --------------------------------------------------------

    day("Sunday", [
      activity({
        id: "deload-sunday-recovery",
        type: "Recovery",
        label: "Recovery",
        ...RECOVERY_DAY_PRESCRIPTION,
      }),
    ]),
  ],
});


// ============================================================
// Fitness OS Training Plan
// ============================================================

export const fitnessOsTrainingPlan: TrainingPlan = {
  id: "fitness-os-default",
  name: "Fitness OS",

  weeks: [
    week0,
    week1,
    week2,
    week3,
    week4,
    week5,
    week6,
    steadyState,
  ],
};
