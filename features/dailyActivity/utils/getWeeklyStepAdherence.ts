// ============================================================
// Types
// ============================================================

export interface DailyStepAdherence {
  date: string;

  targetSteps?: number;

  actualSteps?: number;
}


export interface WeeklyStepAdherence {
  daysEvaluated: number;

  daysWithTarget: number;

  daysLogged: number;

  daysMet: number;

  daysBelowTarget: number;

  daysMetPercent?: number;

  averageIntakePercent?: number;

  dataCoveragePercent?: number;
}


// ============================================================
// Weekly Aggregation
// ============================================================

export function getWeeklyStepAdherence(
  dailyAdherence:
    DailyStepAdherence[]
): WeeklyStepAdherence {
  const daysWithTarget =
    dailyAdherence.filter(
      (
        day
      ) =>
        day.targetSteps !==
        undefined
    ).length;

  const loggedDays =
    dailyAdherence.filter(
      (
        day
      ) =>
        day.targetSteps !==
          undefined &&
        day.actualSteps !==
          undefined
    );

  const daysMet =
    loggedDays.filter(
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

  const daysBelowTarget =
    loggedDays.length -
    daysMet;

  const daysMetPercent =
    loggedDays.length >
    0
      ? Math.round(
          (
            daysMet /
            loggedDays.length
          ) *
            100
        )
      : undefined;

  const averageIntakePercent =
    loggedDays.length >
    0
      ? Math.round(
          (
            loggedDays.reduce(
              (
                total,
                day
              ) => {
                const target =
                  day.targetSteps;

                const actual =
                  day.actualSteps;

                if (
                  target ===
                    undefined ||
                  actual ===
                    undefined ||
                  target <=
                    0
                ) {
                  return total;
                }

                return (
                  total +
                  actual /
                    target
                );
              },
              0
            ) /
            loggedDays.length
          ) *
            100
        )
      : undefined;

  const dataCoveragePercent =
    daysWithTarget >
    0
      ? Math.round(
          (
            loggedDays.length /
            daysWithTarget
          ) *
            100
        )
      : undefined;


  return {
    daysEvaluated:
      dailyAdherence.length,

    daysWithTarget,

    daysLogged:
      loggedDays.length,

    daysMet,

    daysBelowTarget,

    daysMetPercent,

    averageIntakePercent,

    dataCoveragePercent,
  };
}