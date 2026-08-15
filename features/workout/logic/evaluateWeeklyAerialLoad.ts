import type {
  WeeklyAdherenceResult,
} from "./evaluateWeeklyAdherence";


// ============================================================
// Weekly Aerial Load
// ============================================================

export type WeeklyAerialLoadStatus =
  | "NoData"
  | "Participated"
  | "MultipleSessions";


export interface WeeklyAerialLoadEvaluation {
  status: WeeklyAerialLoadStatus;

  scheduledAerialCount: number;

  completedAerialCount: number;

  substitutionAerialCount: number;

  completedSubstitutionAerialCount: number;

  factor?: string;
}


// ============================================================
// Evaluate Weekly Aerial Load
// ============================================================

export function evaluateWeeklyAerialLoad(
  adherence: WeeklyAdherenceResult
): WeeklyAerialLoadEvaluation {
  const aerialActivities =
    adherence.activities.filter(
      (item) =>
        item.activity.type ===
          "Aerial"
    );


  // ----------------------------------------------------------
  // No Scheduled Aerial
  // ----------------------------------------------------------

  if (aerialActivities.length === 0) {
    return {
      status: "NoData",

      scheduledAerialCount: 0,

      completedAerialCount: 0,

      substitutionAerialCount: 0,

      completedSubstitutionAerialCount: 0,
    };
  }


  // ----------------------------------------------------------
  // Participation
  // ----------------------------------------------------------

  const completedAerialActivities =
    aerialActivities.filter(
      (item) =>
        item.completed
    );


  const substitutionAerialActivities =
    aerialActivities.filter(
      (item) =>
        Boolean(
          item.activity
            .substitutionGroup
        )
    );


  const completedSubstitutionAerialActivities =
    substitutionAerialActivities.filter(
      (item) =>
        item.completed
    );


  const completedAerialCount =
    completedAerialActivities.length;


  // ----------------------------------------------------------
  // Scheduled But Not Performed
  // ----------------------------------------------------------
  //
  // Aerial is optional in the current training model.
  //
  // Not participating therefore should not independently make
  // the weekly progression decision worse. Adherence already
  // evaluates any substitution requirement that the aerial
  // activity belongs to.

  if (completedAerialCount === 0) {
    return {
      status: "NoData",

      scheduledAerialCount:
        aerialActivities.length,

      completedAerialCount: 0,

      substitutionAerialCount:
        substitutionAerialActivities.length,

      completedSubstitutionAerialCount: 0,
    };
  }


  // ----------------------------------------------------------
  // Completed Multiple Sessions
  // ----------------------------------------------------------

  if (completedAerialCount >= 2) {
    return {
      status: "MultipleSessions",

      scheduledAerialCount:
        aerialActivities.length,

      completedAerialCount,

      substitutionAerialCount:
        substitutionAerialActivities.length,

      completedSubstitutionAerialCount:
        completedSubstitutionAerialActivities.length,

      factor:
        `${completedAerialCount} scheduled aerial sessions were completed and counted as meaningful weekly training load.`,
    };
  }


  // ----------------------------------------------------------
  // Completed One Session
  // ----------------------------------------------------------

  return {
    status: "Participated",

    scheduledAerialCount:
      aerialActivities.length,

    completedAerialCount,

    substitutionAerialCount:
      substitutionAerialActivities.length,

    completedSubstitutionAerialCount:
      completedSubstitutionAerialActivities.length,

    factor:
      "1 scheduled aerial session was completed and counted as meaningful weekly training load.",
  };
}