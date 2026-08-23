import {
  deloadWeek,
} from "../trainingPlan";

import type {
  RunProgressionPrescription,
  TrainingActivity,
  TrainingDay,
  TrainingDayOfWeek,
  TrainingPlan,
  TrainingPlanState,
  TrainingWeek,
  TrainingWeekType,
} from "../types";


// ============================================================
// Result
// ============================================================

export interface TrainingScheduleForDate {
  date: string;

  // Number of calendar days since the plan began.
  daysSinceStart: number;

  // Number of complete calendar weeks since Week 0 began.
  elapsedWeek: number;

  // Actual program week being used.
  //
  // Once the ramp reaches steady state, this remains at the
  // steady-state week number.
  //
  // Deload also belongs to the steady-state phase, so it uses
  // the same program week number while exposing a different
  // phaseId / weekType.
  programWeek: number;

  phaseId: string;
  phaseName: string;
  phaseDescription?: string;

  weekType: TrainingWeekType;

  dayOfWeek:
    TrainingDayOfWeek;

  trainingDay:
    TrainingDay;

  repeating: boolean;

  // True when this calendar week has been explicitly assigned
  // the reusable deload template.
  isDeload: boolean;

  // True only when the target date falls inside a calendar
  // week that was explicitly inserted as a held/repeated week.
  isRepeatedWeek: boolean;
}


// ============================================================
// Constants
// ============================================================

const DAY_IN_MS =
  24 * 60 * 60 * 1000;

const DAY_NAMES:
  TrainingDayOfWeek[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];


// ============================================================
// Date Helpers
// ============================================================

// Parse YYYY-MM-DD as a LOCAL calendar date.
//
// We intentionally do not use:
//
// new Date("2026-08-10")
//
// because JavaScript interprets that form as UTC, which can
// cause the local calendar day to shift in some time zones.
function parseLocalDate(
  dateString: string
): Date | null {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})$/.exec(
      dateString
    );

  if (!match) {
    return null;
  }

  const year =
    Number(match[1]);

  const month =
    Number(match[2]);

  const day =
    Number(match[3]);

  const date =
    new Date(
      year,
      month - 1,
      day
    );

  // Reject impossible dates such as 2026-02-31.
  if (
    date.getFullYear() !==
      year ||
    date.getMonth() !==
      month - 1 ||
    date.getDate() !==
      day
  ) {
    return null;
  }

  return date;
}


// ------------------------------------------------------------
// Normalize Calendar Date
// ------------------------------------------------------------
//
// Date subtraction across daylight-saving transitions can
// produce 23- or 25-hour "days".
//
// Date.UTC gives us stable calendar-day arithmetic without
// changing the user's actual local weekday.
function getCalendarDayNumber(
  date: Date
) {
  return Math.floor(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ) / DAY_IN_MS
  );
}


// ------------------------------------------------------------
// Format Local Date
// ------------------------------------------------------------

function formatLocalDate(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


// ------------------------------------------------------------
// Get Monday
// ------------------------------------------------------------

function getMonday(
  date: Date
) {
  const result =
    new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

  const day =
    result.getDay();

  const daysSinceMonday =
    day === 0
      ? 6
      : day - 1;

  result.setDate(
    result.getDate() -
      daysSinceMonday
  );

  return result;
}


// ============================================================
// Training Week Helpers
// ============================================================

function getRepeatingWeek(
  plan: TrainingPlan
): TrainingWeek | undefined {
  return plan.weeks.find(
    (week) =>
      week.repeating
  );
}


// ------------------------------------------------------------
// Resolve Program Week
// ------------------------------------------------------------

function getProgramWeek(
  plan: TrainingPlan,
  elapsedWeek: number
): TrainingWeek | undefined {
  // First try to find an exact non-repeating program week.
  const exactWeek =
    plan.weeks.find(
      (week) =>
        week.weekNumber ===
          elapsedWeek &&
        !week.repeating
    );

  if (exactWeek) {
    return exactWeek;
  }


  // Once the calendar progresses beyond the ramp, use the
  // repeating steady-state week.
  const repeatingWeek =
    getRepeatingWeek(
      plan
    );

  if (
    repeatingWeek &&
    elapsedWeek >=
      repeatingWeek.weekNumber
  ) {
    return repeatingWeek;
  }


  // Defensive fallback for unusual/custom plans.
  return plan.weeks.find(
    (week) =>
      week.weekNumber ===
      elapsedWeek
  );
}


// ------------------------------------------------------------
// Is Deload Calendar Week
// ------------------------------------------------------------

function isDeloadWeek(
  state: TrainingPlanState,
  targetDate: Date
) {
  const weekStart =
    getMonday(
      targetDate
    );

  const weekStartDate =
    formatLocalDate(
      weekStart
    );

  return (
    state.deloadWeekStartDates ??
    []
  ).includes(
    weekStartDate
  );
}


// ============================================================
// Adaptive Running Prescription
// ============================================================

function applyRunningPrescription(
  activity: TrainingActivity,
  prescription:
    RunProgressionPrescription
): TrainingActivity {
  return {
    ...activity,

    label:
      prescription.label,

    cardioIntensity:
      prescription.intensity,

    durationMin:
      prescription.durationMin,

    durationMax:
      prescription.durationMax,

    runIntervalMinutes:
      prescription
        .runIntervalMinutes,

    walkIntervalMinutes:
      prescription
        .walkIntervalMinutes,

    note:
      prescription.note ??
      activity.note,
  };
}


function applyAdaptiveRunningProgression(
  trainingDay: TrainingDay,
  state: TrainingPlanState,
  weekType: TrainingWeekType
): TrainingDay {
  // Adaptive running prescriptions apply only to normal
  // steady-state training. Ramp and deload weeks retain their
  // explicit template prescriptions.
  if (
    weekType !==
      "SteadyState"
  ) {
    return trainingDay;
  }

  const runningProgression =
    state.runningProgression;

  if (!runningProgression) {
    return trainingDay;
  }

  let changed =
    false;

  const activities =
    trainingDay.activities.map(
      (activity) => {
        if (
          activity.type !==
            "Run" ||
          !activity
            .runProgressionRole
        ) {
          return activity;
        }

        const prescription =
          runningProgression[
            activity
              .runProgressionRole
          ];

        if (!prescription) {
          return activity;
        }

        changed =
          true;

        return applyRunningPrescription(
          activity,
          prescription
        );
      }
    );

  if (!changed) {
    return trainingDay;
  }

  // Return a new object so imported plan templates remain
  // immutable and schedule resolution stays deterministic.
  return {
    ...trainingDay,
    activities,
  };
}


// ============================================================
// Get Training Schedule For Date
// ============================================================

export function getTrainingScheduleForDate(
  plan: TrainingPlan,
  state: TrainingPlanState,
  targetDate: Date
): TrainingScheduleForDate | null {
  // ----------------------------------------------------------
  // Validate Plan
  // ----------------------------------------------------------

  if (
    plan.id !==
    state.trainingPlanId
  ) {
    return null;
  }


  // ----------------------------------------------------------
  // Start Date
  // ----------------------------------------------------------

  const startDate =
    parseLocalDate(
      state.startDate
    );

  if (!startDate) {
    return null;
  }


  // ----------------------------------------------------------
  // Calendar Difference
  // ----------------------------------------------------------

  const startDayNumber =
    getCalendarDayNumber(
      startDate
    );

  const targetDayNumber =
    getCalendarDayNumber(
      targetDate
    );

  const daysSinceStart =
    targetDayNumber -
    startDayNumber;


  // Dates before the training plan starts do not have a
  // prescription.
  if (
    daysSinceStart < 0
  ) {
    return null;
  }


  // ----------------------------------------------------------
  // Elapsed Week
  // ----------------------------------------------------------

  const elapsedWeek =
    Math.floor(
      daysSinceStart / 7
    );


  // ----------------------------------------------------------
  // Held / Repeated Weeks
  // ----------------------------------------------------------
  //
  // Each recorded hold inserts one additional calendar week
  // before the program is allowed to advance.
  //
  // Only holds whose repeat date has already occurred should
  // affect the requested date.

  const heldWeekCount =
    (
      state.heldWeekStartDates ??
      []
    ).filter(
      (
        heldStartDate
      ) => {
        const heldDate =
          parseLocalDate(
            heldStartDate
          );

        if (!heldDate) {
          return false;
        }

        return (
          getCalendarDayNumber(
            heldDate
          ) <=
          targetDayNumber
        );
      }
    ).length;


  // Calendar time can continue advancing while the training
  // program remains on a repeated week.
  const effectiveElapsedWeek =
    Math.max(
      0,
      elapsedWeek -
        heldWeekCount
    );


  // ----------------------------------------------------------
  // Current Calendar Week Is Repeated
  // ----------------------------------------------------------
  //
  // heldWeekStartDates stores the Monday of each calendar week
  // that was inserted because the previous program week was
  // held.
  //
  // Comparing against the target date's Monday tells us
  // whether THIS specific calendar week is a repeat, rather
  // than merely whether a repeat happened sometime in the
  // past.

  const targetWeekStart =
    getMonday(
      targetDate
    );

  const targetWeekStartDate =
    formatLocalDate(
      targetWeekStart
    );

  const isRepeatedWeek =
    (
      state.heldWeekStartDates ??
      []
    ).includes(
      targetWeekStartDate
    );


  // ----------------------------------------------------------
  // Normal Program Week
  // ----------------------------------------------------------

  const normalTrainingWeek =
    getProgramWeek(
      plan,
      effectiveElapsedWeek
    );

  if (!normalTrainingWeek) {
    return null;
  }


  // ----------------------------------------------------------
  // Deload Override
  // ----------------------------------------------------------
  //
  // Deload weeks are not part of the linear Week 0 → Week 7
  // array.
  //
  // Instead, the progression engine assigns a specific
  // calendar Monday as a deload. When the requested date falls
  // inside that calendar week, use the reusable deload template
  // instead of the normal steady-state template.

  const deload =
    isDeloadWeek(
      state,
      targetDate
    );


  const trainingWeek =
    deload
      ? deloadWeek
      : normalTrainingWeek;


  // ----------------------------------------------------------
  // Day Of Week
  // ----------------------------------------------------------

  const dayOfWeek =
    DAY_NAMES[
      targetDate.getDay()
    ];

  const baseTrainingDay =
    trainingWeek.days.find(
      (day) =>
        day.day ===
        dayOfWeek
    );

  if (!baseTrainingDay) {
    return null;
  }


  // ----------------------------------------------------------
  // Adaptive Running Overlay
  // ----------------------------------------------------------
  //
  // Persisted Development / Endurance prescriptions replace
  // the matching steady-state Run activity fields for this
  // resolved schedule only.
  //
  // The underlying imported training-plan template is never
  // mutated.

  const trainingDay =
    applyAdaptiveRunningProgression(
      baseTrainingDay,
      state,
      trainingWeek.weekType
    );


  // ----------------------------------------------------------
  // Result
  // ----------------------------------------------------------

  return {
    date:
      formatLocalDate(
        targetDate
      ),

    daysSinceStart,

    elapsedWeek,

    programWeek:
      trainingWeek.weekNumber,

    phaseId:
      trainingWeek.id,

    phaseName:
      trainingWeek.name,

    phaseDescription:
      trainingWeek.description,

    weekType:
      trainingWeek.weekType,

    dayOfWeek,

    trainingDay,

    repeating:
      trainingWeek.repeating ===
      true,

    isDeload:
      deload,

    isRepeatedWeek,
  };
}
