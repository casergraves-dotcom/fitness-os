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
import {
  getTrainingWeekStart,
} from "@/lib/date/trainingWeek";


// ============================================================
// Result
// ============================================================

export interface TrainingScheduleActivityContext {
  // Original local calendar date on which this occurrence was
  // prescribed. This remains stable if the occurrence is moved.
  originalDate: string;

  // Persisted strength-workout variant selected for this specific
  // occurrence, if one exists.
  strengthWorkoutVariantId?:
    string;
}


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

  // Per-occurrence metadata keyed by stable TrainingActivity ID.
  //
  // This keeps occurrence-specific state separate from the reusable
  // TrainingActivity template while still making it available to
  // Today/workout launch consumers.
  activityContexts:
    Record<
      string,
      TrainingScheduleActivityContext
    >;

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

function getCanonicalWeekStart(
  date: Date
) {
  return getTrainingWeekStart(date);
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
// Resolve Return-to-Training Week
// ------------------------------------------------------------
//
// A training interruption does not rewrite the original plan
// start date.
//
// Instead, the calendar week stored in returnWeekStartDate
// temporarily becomes the beginning of a new pass through the
// existing ramp templates.
//
// Example:
//
// returnRampWeek = 2
// returnWeekStartDate = 2026-09-21
//
// 2026-09-21 -> Week 2
// 2026-09-28 -> Week 3
// 2026-10-05 -> Week 4
// ...
// Week 7+    -> Steady State
//
// Held weeks that occur on or after the return week also pause
// this temporary ramp, just as they pause normal progression.
//
// Holds from before the interruption do not shift the new
// return ramp.

function getReturnToTrainingWeek(
  plan: TrainingPlan,
  state: TrainingPlanState,
  targetDate: Date
): TrainingWeek | undefined {
  const interruption =
    state.trainingInterruption;

  if (!interruption) {
    return undefined;
  }


  const returnWeekStart =
    parseLocalDate(
      interruption
        .returnWeekStartDate
    );

  if (!returnWeekStart) {
    return undefined;
  }


  const targetWeekStart =
    getCanonicalWeekStart(
      targetDate
    );

  const returnWeekStartMonday =
    getCanonicalWeekStart(
      returnWeekStart
    );


  const targetWeekDayNumber =
    getCalendarDayNumber(
      targetWeekStart
    );

  const returnWeekDayNumber =
    getCalendarDayNumber(
      returnWeekStartMonday
    );


  // Dates before the return week continue to resolve from the
  // original training-plan calendar.
  if (
    targetWeekDayNumber <
    returnWeekDayNumber
  ) {
    return undefined;
  }


  const elapsedReturnWeeks =
    Math.floor(
      (
        targetWeekDayNumber -
        returnWeekDayNumber
      ) / 7
    );


  const heldReturnWeekCount =
    (
      state.heldWeekStartDates ??
      []
    ).filter(
      (heldStartDate) => {
        const heldDate =
          parseLocalDate(
            heldStartDate
          );

        if (!heldDate) {
          return false;
        }

        const heldDayNumber =
          getCalendarDayNumber(
            getCanonicalWeekStart(
              heldDate
            )
          );

        return (
          heldDayNumber >=
            returnWeekDayNumber &&
          heldDayNumber <=
            targetWeekDayNumber
        );
      }
    ).length;


  const effectiveReturnWeeks =
    Math.max(
      0,
      elapsedReturnWeeks -
        heldReturnWeekCount
    );


  const returnProgramWeek =
    interruption
      .returnRampWeek +
    effectiveReturnWeeks;


  return getProgramWeek(
    plan,
    returnProgramWeek
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
    getCanonicalWeekStart(
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
// Activity Occurrence Context
// ============================================================

function getStrengthWorkoutVariantIdForOccurrence(
  state: TrainingPlanState,
  trainingActivityId: string,
  originalDate: string
) {
  return (
    state.activityVariantOverrides ??
    []
  ).find(
    (override) =>
      override.trainingActivityId ===
        trainingActivityId &&
      override.originalDate ===
        originalDate
  )?.strengthWorkoutVariantId;
}


function getActivityContext(
  state: TrainingPlanState,
  activity: TrainingActivity,
  originalDate: string
): TrainingScheduleActivityContext {
  return {
    originalDate,

    strengthWorkoutVariantId:
      activity.type ===
        "Strength"
        ? getStrengthWorkoutVariantIdForOccurrence(
            state,
            activity.id,
            originalDate
          )
        : undefined,
  };
}


// ============================================================
// Get Training Schedule For Date
// ============================================================

function getBaseTrainingScheduleForDate(
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
  // heldWeekStartDates stores the Sunday of each calendar week
  // that was inserted because the previous program week was
  // held.
  //
  // Comparing against the target date's Monday tells us
  // whether THIS specific calendar week is a repeat, rather
  // than merely whether a repeat happened sometime in the
  // past.

  const targetWeekStart =
    getCanonicalWeekStart(
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
  // Return-to-Training Override
  // ----------------------------------------------------------
  //
  // A return ramp temporarily replaces the normal calendar
  // program week without changing the original plan start date.
  //
  // Once the temporary ramp reaches Week 7, getProgramWeek()
  // naturally resolves the repeating steady-state template.
  //
  // Existing strength history, running progression, decision
  // history, and deload history remain stored in state.

  const returnTrainingWeek =
    getReturnToTrainingWeek(
      plan,
      state,
      targetDate
    );

  const baseTrainingWeek =
    returnTrainingWeek ??
    normalTrainingWeek;


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


  // Deload is a steady-state recovery mechanism.
  //
  // Do not replace an active return-ramp week with a previously
  // scheduled deload. Once the return ramp reaches steady state,
  // normal deload behavior can apply again.
  const useDeload =
    deload &&
    baseTrainingWeek.weekType ===
      "SteadyState";


  const trainingWeek =
    useDeload
      ? deloadWeek
      : baseTrainingWeek;


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


  const date =
    formatLocalDate(
      targetDate
    );


  const activityContexts:
    Record<
      string,
      TrainingScheduleActivityContext
    > = {};

  for (
    const activity of
    trainingDay.activities
  ) {
    activityContexts[
      activity.id
    ] =
      getActivityContext(
        state,
        activity,
        date
      );
  }


  // ----------------------------------------------------------
  // Result
  // ----------------------------------------------------------

  return {
    date,

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

    activityContexts,

    repeating:
      trainingWeek.repeating ===
      true,

    isDeload:
      useDeload,

    isRepeatedWeek,
  };
}
// ============================================================
// Activity Rescheduling Overlay
// ============================================================
//
// Rescheduling is applied after the normal schedule has been
// fully resolved.
//
// This is intentionally outside the base resolver so a moved
// activity can be recovered from its ORIGINAL calendar date,
// including its:
// - ramp / steady-state / deload template
// - adaptive running prescription
// - return-to-training overlay
// - strength-volume prescription
//
// The underlying TrainingPlan templates remain immutable.

interface RescheduledActivityForDate {
  activity:
    TrainingActivity;

  originalDate:
    string;
}


function getRescheduledActivitiesForDate(
  plan: TrainingPlan,
  state: TrainingPlanState,
  targetDate: Date
): RescheduledActivityForDate[] {
  const targetDateString =
    formatLocalDate(
      targetDate
    );

  const reschedules =
    state.activityReschedules ??
    [];

  const destinationMoves =
    reschedules.filter(
      (reschedule) =>
        reschedule.scheduledDate ===
          targetDateString &&
        reschedule.originalDate !==
          targetDateString
    );

  const activities:
    RescheduledActivityForDate[] = [];

  for (
    const reschedule of
    destinationMoves
  ) {
    const originalDate =
      parseLocalDate(
        reschedule.originalDate
      );

    if (!originalDate) {
      continue;
    }

    // Resolve the original occurrence without applying the
    // rescheduling overlay again. This avoids recursion while
    // preserving the exact prescription that belonged to the
    // original date.
    const originalSchedule =
      getBaseTrainingScheduleForDate(
        plan,
        state,
        originalDate
      );

    if (!originalSchedule) {
      continue;
    }

    const activity =
      originalSchedule
        .trainingDay
        .activities
        .find(
          (candidate) =>
            candidate.id ===
              reschedule
                .trainingActivityId
        );

    if (!activity) {
      continue;
    }

    activities.push({
      activity,

      originalDate:
        reschedule.originalDate,
    });
  }

  return activities;
}


function applyActivityRescheduling(
  plan: TrainingPlan,
  state: TrainingPlanState,
  targetDate: Date,
  schedule:
    TrainingScheduleForDate
): TrainingScheduleForDate {
  const targetDateString =
    formatLocalDate(
      targetDate
    );

  const reschedules =
    state.activityReschedules ??
    [];

  if (
    reschedules.length ===
    0
  ) {
    return schedule;
  }


  // ----------------------------------------------------------
  // Suppress Original Occurrences
  // ----------------------------------------------------------

  const movedFromThisDate =
    new Set(
      reschedules
        .filter(
          (reschedule) =>
            reschedule.originalDate ===
              targetDateString &&
            reschedule.scheduledDate !==
              targetDateString
        )
        .map(
          (reschedule) =>
            reschedule
              .trainingActivityId
        )
    );

  const retainedActivities =
    schedule
      .trainingDay
      .activities
      .filter(
        (activity) =>
          !movedFromThisDate.has(
            activity.id
          )
      );


  // ----------------------------------------------------------
  // Inject Destination Occurrences
  // ----------------------------------------------------------

  const movedToThisDate =
    getRescheduledActivitiesForDate(
      plan,
      state,
      targetDate
    );


  // Defensive de-duplication by activity ID.
  //
  // A valid state transition should already prevent one
  // occurrence from having multiple active destinations, but
  // older/manually edited state should not produce duplicates.
  const activities = [
    ...retainedActivities,
  ];


  const activityContexts:
    Record<
      string,
      TrainingScheduleActivityContext
    > = {};

  for (
    const activity of
    retainedActivities
  ) {
    const existingContext =
      schedule.activityContexts[
        activity.id
      ];

    activityContexts[
      activity.id
    ] =
      existingContext ??
      getActivityContext(
        state,
        activity,
        targetDateString
      );
  }


  for (
    const moved of
    movedToThisDate
  ) {
    if (
      !activities.some(
        (existing) =>
          existing.id ===
            moved.activity.id
      )
    ) {
      activities.push(
        moved.activity
      );

      activityContexts[
        moved.activity.id
      ] =
        getActivityContext(
          state,
          moved.activity,
          moved.originalDate
        );
    }
  }


  // ----------------------------------------------------------
  // Result
  // ----------------------------------------------------------

  return {
    ...schedule,

    trainingDay: {
      ...schedule.trainingDay,

      activities,
    },

    activityContexts,
  };
}


// ============================================================
// Public Schedule Resolver
// ============================================================

export function getTrainingScheduleForDate(
  plan: TrainingPlan,
  state: TrainingPlanState,
  targetDate: Date
): TrainingScheduleForDate | null {
  const baseSchedule =
    getBaseTrainingScheduleForDate(
      plan,
      state,
      targetDate
    );

  if (!baseSchedule) {
    return null;
  }

  return applyActivityRescheduling(
    plan,
    state,
    targetDate,
    baseSchedule
  );
}
