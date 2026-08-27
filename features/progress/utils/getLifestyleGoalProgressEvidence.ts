// ============================================================
// Imports
// ============================================================

import {
  getNutritionAdherence,
} from "@/features/nutrition/utils/getNutritionAdherence";

import type {
  DailyNutritionRecord,
  NutritionTarget,
} from "@/features/nutrition/nutritionTypes";

import type {
  DailyStepRecord,
  StepTarget,
} from "@/features/dailyActivity/dailyActivityTypes";

import type {
  BodyCompositionGoalProgress,
} from "../hooks/useBodyCompositionGoalProgress";


// ============================================================
// Types
// ============================================================

export interface LifestyleEvidenceSignal {
  eligibleDays: number;

  loggedDays: number;

  coveragePercent?: number;

  evidenceReady: boolean;
}


export interface LifestyleAdherenceEvidence
  extends LifestyleEvidenceSignal {
  daysMeetingTarget: number;

  adherencePercent?: number;

  averagePercentOfTarget?: number;
}


export interface CalorieGoalProgressEvidence
  extends LifestyleEvidenceSignal {
  daysOnTarget: number;

  daysBelowTarget: number;

  daysAboveTarget: number;

  adherencePercent?: number;

  averagePercentOfTarget?: number;
}


export interface LifestyleGoalProgressEvidence {
  windowStartDate: string;

  windowEndDate: string;

  windowDays: number;

  bodyComposition: {
    status:
      BodyCompositionGoalProgress["status"];

    expectedWeeklyWeightChangeLb?: number;

    observedWeeklyWeightChangeLb?: number;

    observedTrendDays?: number;

    evidenceReady: boolean;
  };

  nutrition: {
    protein:
      LifestyleAdherenceEvidence;

    calories:
      CalorieGoalProgressEvidence;
  };

  activity: {
    steps:
      LifestyleAdherenceEvidence;
  };

  lifestyleEvidenceReady: boolean;
}


// ============================================================
// Constants
// ============================================================

const EVIDENCE_WINDOW_DAYS =
  28;


// Require at least two calendar weeks during which a target
// existed before lifestyle adherence can be considered
// multi-week evidence.
const MIN_ELIGIBLE_EVIDENCE_DAYS =
  14;


// Missing days remain missing data rather than failures, but
// extremely sparse logging should not be treated as sufficient
// evidence for later interpretation.
const MIN_DATA_COVERAGE_FRACTION =
  0.5;


// ============================================================
// Date Helpers
// ============================================================

function formatLocalDate(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}


function getDateRange(
  endDate: Date,
  dayCount: number
) {
  const dates:
    string[] = [];

  for (
    let offset =
      dayCount - 1;
    offset >= 0;
    offset -= 1
  ) {
    const date =
      new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate() -
          offset
      );

    dates.push(
      formatLocalDate(
        date
      )
    );
  }

  return dates;
}


// ============================================================
// Target Lookup
// ============================================================

function getNutritionTargetForDate(
  history:
    NutritionTarget[],
  date: string
) {
  return (
    history.find(
      (
        target
      ) =>
        target.effectiveDate <=
        date
    ) ??
    null
  );
}


function getStepTargetForDate(
  history:
    StepTarget[],
  date: string
) {
  return (
    history.find(
      (
        target
      ) =>
        target.effectiveDate <=
        date
    ) ??
    null
  );
}


// ============================================================
// Evidence Readiness
// ============================================================

function getCoveragePercent(
  loggedDays: number,
  eligibleDays: number
) {
  if (
    eligibleDays ===
    0
  ) {
    return undefined;
  }

  return Math.round(
    (
      loggedDays /
      eligibleDays
    ) *
      100
  );
}


function isEvidenceReady(
  eligibleDays: number,
  loggedDays: number
) {
  if (
    eligibleDays <
    MIN_ELIGIBLE_EVIDENCE_DAYS
  ) {
    return false;
  }

  return (
    loggedDays /
    eligibleDays
  ) >=
    MIN_DATA_COVERAGE_FRACTION;
}


// ============================================================
// Average Helpers
// ============================================================

function getAveragePercent(
  values: {
    actual: number;
    target: number;
  }[]
) {
  if (
    values.length ===
    0
  ) {
    return undefined;
  }

  const averageRatio =
    values.reduce(
      (
        total,
        value
      ) =>
        total +
        value.actual /
          value.target,
      0
    ) /
    values.length;

  return Math.round(
    averageRatio *
      100
  );
}


// ============================================================
// Evidence
// ============================================================

export function getLifestyleGoalProgressEvidence({
  currentDate,
  goalProgress,
  nutritionRecords,
  nutritionTargetHistory,
  stepRecords,
  stepTargetHistory,
}: {
  currentDate: Date;

  goalProgress:
    BodyCompositionGoalProgress;

  nutritionRecords:
    DailyNutritionRecord[];

  nutritionTargetHistory:
    NutritionTarget[];

  stepRecords:
    DailyStepRecord[];

  stepTargetHistory:
    StepTarget[];
}): LifestyleGoalProgressEvidence {
  const dates =
    getDateRange(
      currentDate,
      EVIDENCE_WINDOW_DAYS
    );

  const windowStartDate =
    dates[0];

  const windowEndDate =
    dates[
      dates.length - 1
    ];


  // ----------------------------------------------------------
  // Nutrition Daily Evidence
  // ----------------------------------------------------------

  const nutritionDays =
    dates.map(
      (
        date
      ) => {
        const target =
          getNutritionTargetForDate(
            nutritionTargetHistory,
            date
          );

        const record =
          nutritionRecords.find(
            (
              candidate
            ) =>
              candidate.date ===
              date
          ) ??
          null;

        return getNutritionAdherence(
          date,
          target,
          record
        );
      }
    );


  // ----------------------------------------------------------
  // Protein Evidence
  // ----------------------------------------------------------

  const proteinEligibleDays =
    nutritionDays.filter(
      (
        day
      ) =>
        day.protein.targetGrams !==
        undefined
    );

  const proteinLoggedDays =
    proteinEligibleDays.filter(
      (
        day
      ) =>
        day.protein.actualGrams !==
        undefined
    );

  const proteinDaysMeetingTarget =
    proteinLoggedDays.filter(
      (
        day
      ) =>
        day.protein.status ===
        "Met"
    ).length;

  const proteinValues =
    proteinLoggedDays
      .map(
        (
          day
        ) => {
          const actual =
            day.protein.actualGrams;

          const target =
            day.protein.targetGrams;

          if (
            actual ===
              undefined ||
            target ===
              undefined ||
            target <=
              0
          ) {
            return null;
          }

          return {
            actual,
            target,
          };
        }
      )
      .filter(
        (
          value
        ): value is {
          actual: number;
          target: number;
        } =>
          value !==
          null
      );

  const proteinEvidenceReady =
    isEvidenceReady(
      proteinEligibleDays.length,
      proteinLoggedDays.length
    );


  // ----------------------------------------------------------
  // Calorie Evidence
  // ----------------------------------------------------------

  const calorieEligibleDays =
    nutritionDays.filter(
      (
        day
      ) =>
        day.calories.targetCalories !==
        undefined
    );

  const calorieLoggedDays =
    calorieEligibleDays.filter(
      (
        day
      ) =>
        day.calories.actualCalories !==
        undefined
    );

  const calorieDaysOnTarget =
    calorieLoggedDays.filter(
      (
        day
      ) =>
        day.calories.status ===
        "OnTarget"
    ).length;

  const calorieDaysBelowTarget =
    calorieLoggedDays.filter(
      (
        day
      ) =>
        day.calories.status ===
        "BelowTarget"
    ).length;

  const calorieDaysAboveTarget =
    calorieLoggedDays.filter(
      (
        day
      ) =>
        day.calories.status ===
        "AboveTarget"
    ).length;

  const calorieValues =
    calorieLoggedDays
      .map(
        (
          day
        ) => {
          const actual =
            day.calories.actualCalories;

          const target =
            day.calories.targetCalories;

          if (
            actual ===
              undefined ||
            target ===
              undefined ||
            target <=
              0
          ) {
            return null;
          }

          return {
            actual,
            target,
          };
        }
      )
      .filter(
        (
          value
        ): value is {
          actual: number;
          target: number;
        } =>
          value !==
          null
      );

  const calorieEvidenceReady =
    isEvidenceReady(
      calorieEligibleDays.length,
      calorieLoggedDays.length
    );


  // ----------------------------------------------------------
  // Step Evidence
  // ----------------------------------------------------------

  const stepDays =
    dates.map(
      (
        date
      ) => {
        const target =
          getStepTargetForDate(
            stepTargetHistory,
            date
          );

        const record =
          stepRecords.find(
            (
              candidate
            ) =>
              candidate.date ===
              date
          ) ??
          null;

        return {
          date,

          targetSteps:
            target?.dailyStepTarget,

          actualSteps:
            record?.steps,
        };
      }
    );

  const stepEligibleDays =
    stepDays.filter(
      (
        day
      ) =>
        day.targetSteps !==
        undefined
    );

  const stepLoggedDays =
    stepEligibleDays.filter(
      (
        day
      ) =>
        day.actualSteps !==
        undefined
    );

  const stepDaysMeetingTarget =
    stepLoggedDays.filter(
      (
        day
      ) =>
        day.actualSteps !==
          undefined &&
        day.targetSteps !==
          undefined &&
        day.actualSteps >=
          day.targetSteps
    ).length;

  const stepValues =
    stepLoggedDays
      .map(
        (
          day
        ) => {
          const actual =
            day.actualSteps;

          const target =
            day.targetSteps;

          if (
            actual ===
              undefined ||
            target ===
              undefined ||
            target <=
              0
          ) {
            return null;
          }

          return {
            actual,
            target,
          };
        }
      )
      .filter(
        (
          value
        ): value is {
          actual: number;
          target: number;
        } =>
          value !==
          null
      );

  const stepEvidenceReady =
    isEvidenceReady(
      stepEligibleDays.length,
      stepLoggedDays.length
    );


  // ----------------------------------------------------------
  // Body Composition Evidence
  // ----------------------------------------------------------

  const bodyCompositionEvidenceReady =
    goalProgress.status !==
    "InsufficientData";


  // ----------------------------------------------------------
  // Result
  // ----------------------------------------------------------

  return {
    windowStartDate,

    windowEndDate,

    windowDays:
      EVIDENCE_WINDOW_DAYS,

    bodyComposition: {
      status:
        goalProgress.status,

      expectedWeeklyWeightChangeLb:
        goalProgress
          .expectedWeeklyWeightChangeLb,

      observedWeeklyWeightChangeLb:
        goalProgress
          .observedWeeklyWeightChangeLb,

      observedTrendDays:
        goalProgress
          .observedTrendDays,

      evidenceReady:
        bodyCompositionEvidenceReady,
    },

    nutrition: {
      protein: {
        eligibleDays:
          proteinEligibleDays.length,

        loggedDays:
          proteinLoggedDays.length,

        coveragePercent:
          getCoveragePercent(
            proteinLoggedDays.length,
            proteinEligibleDays.length
          ),

        evidenceReady:
          proteinEvidenceReady,

        daysMeetingTarget:
          proteinDaysMeetingTarget,

        adherencePercent:
          proteinLoggedDays.length >
          0
            ? Math.round(
                (
                  proteinDaysMeetingTarget /
                  proteinLoggedDays.length
                ) *
                  100
              )
            : undefined,

        averagePercentOfTarget:
          getAveragePercent(
            proteinValues
          ),
      },

      calories: {
        eligibleDays:
          calorieEligibleDays.length,

        loggedDays:
          calorieLoggedDays.length,

        coveragePercent:
          getCoveragePercent(
            calorieLoggedDays.length,
            calorieEligibleDays.length
          ),

        evidenceReady:
          calorieEvidenceReady,

        daysOnTarget:
          calorieDaysOnTarget,

        daysBelowTarget:
          calorieDaysBelowTarget,

        daysAboveTarget:
          calorieDaysAboveTarget,

        adherencePercent:
          calorieLoggedDays.length >
          0
            ? Math.round(
                (
                  calorieDaysOnTarget /
                  calorieLoggedDays.length
                ) *
                  100
              )
            : undefined,

        averagePercentOfTarget:
          getAveragePercent(
            calorieValues
          ),
      },
    },

    activity: {
      steps: {
        eligibleDays:
          stepEligibleDays.length,

        loggedDays:
          stepLoggedDays.length,

        coveragePercent:
          getCoveragePercent(
            stepLoggedDays.length,
            stepEligibleDays.length
          ),

        evidenceReady:
          stepEvidenceReady,

        daysMeetingTarget:
          stepDaysMeetingTarget,

        adherencePercent:
          stepLoggedDays.length >
          0
            ? Math.round(
                (
                  stepDaysMeetingTarget /
                  stepLoggedDays.length
                ) *
                  100
              )
            : undefined,

        averagePercentOfTarget:
          getAveragePercent(
            stepValues
          ),
      },
    },

    lifestyleEvidenceReady:
      bodyCompositionEvidenceReady &&
      (
        proteinEvidenceReady ||
        calorieEvidenceReady ||
        stepEvidenceReady
      ),
  };
}