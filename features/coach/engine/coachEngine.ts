import {
  calculateReadiness,
} from "@/features/recovery";

import type {
  MorningCheckInRatings,
} from "@/features/recovery";

import type {
  StrengthWorkoutType,
  TrainingActivity,
} from "@/features/workout/types";

import {
  getReadinessContext,
} from "./rules";

import type {
  CoachRecommendation,
  CoachReviewContext,
  CoachReviewContextSummary,
  CoachPreferenceContext,
  CoachTrainingContext,
} from "../types";
import {
  getCoachingPreferencePriority,
} from "../coachingPreferences";

function getPreferenceArea(activity: TrainingActivity) {
  if (activity.type === "Strength") return "strength" as const;
  if (activity.type === "Run") return "running" as const;
  if (activity.type === "Aerial") return "activeHobbies" as const;
  return "recovery" as const;
}

function getPreferenceRankedOptionalActivities(
  activities: TrainingActivity[],
  preferences?: CoachPreferenceContext
) {
  if (!preferences || activities.length === 0 || activities.some((activity) => !activity.optional)) {
    return activities;
  }
  const scored = activities.map((activity) => ({
    activity,
    score: getCoachingPreferencePriority(preferences, getPreferenceArea(activity)),
  }));
  const scores = scored.map((item) => item.score);
  if (Math.max(...scores) === Math.min(...scores)) return activities;
  const best = Math.max(...scores);
  return scored.filter((item) => item.score === best).map((item) => item.activity);
}



// ============================================================
// Activity Helpers
// ============================================================

function getStrengthWorkout(
  activity: TrainingActivity
): StrengthWorkoutType | undefined {
  const workout =
    activity.strengthWorkout;

  if (
    workout === "Gym A" ||
    workout === "Gym B" ||
    workout === "Gym C"
  ) {
    return workout;
  }

  return undefined;
}


function getStrengthActivity(
  activities: TrainingActivity[]
) {
  return activities.find(
    (activity) =>
      activity.type === "Strength"
  );
}


function getRunActivity(
  activities: TrainingActivity[]
) {
  return activities.find(
    (activity) =>
      activity.type === "Run"
  );
}


function getWalkActivity(
  activities: TrainingActivity[]
) {
  return activities.find(
    (activity) =>
      activity.type === "Walk"
  );
}


function getMobilityActivity(
  activities: TrainingActivity[]
) {
  return activities.find(
    (activity) =>
      activity.type === "Mobility"
  );
}


function hasRecoveryActivity(
  activities: TrainingActivity[]
) {
  return activities.some(
    (activity) =>
      activity.type === "Recovery" ||
      activity.type === "Rest"
  );
}


function hasAerialActivity(
  activities: TrainingActivity[]
) {
  return activities.some(
    (activity) =>
      activity.type === "Aerial"
  );
}


type SorenessRegion =
  | "upper body"
  | "lower body"
  | "upper and lower body";


function getSorenessRegion(
  ratings: MorningCheckInRatings,
  threshold: number
): SorenessRegion | undefined {
  const upperSore =
    ratings.UpperBodySoreness >= threshold;

  const lowerSore =
    ratings.LowerBodySoreness >= threshold;

  if (upperSore && lowerSore) {
    return "upper and lower body";
  }

  if (upperSore) {
    return "upper body";
  }

  if (lowerSore) {
    return "lower body";
  }

  return undefined;
}


function getSorenessGuidance(
  region: SorenessRegion
) {
  if (region === "upper body") {
    return "Use exercise substitutions for any pressing or pulling movement that aggravates the soreness.";
  }

  if (region === "lower body") {
    return "Use exercise substitutions for any squat, lunge, hinge, or leg movement that aggravates the soreness.";
  }

  return "Use exercise substitutions for any movement that aggravates the soreness.";
}


// ============================================================
// Coach Engine
// ============================================================

function getDailyCoachRecommendation(
  ratings: MorningCheckInRatings,
  activities: TrainingActivity[] = []
): CoachRecommendation {

  // ----------------------------------------------------------
  // Readiness
  // ----------------------------------------------------------

  const readiness =
    calculateReadiness(
      ratings
    );

  const hasReadiness =
    readiness !== null;

  const readinessContext =
    readiness
      ? getReadinessContext(
          readiness
        )
      : null;


  // ----------------------------------------------------------
  // Scheduled Activities
  // ----------------------------------------------------------

  const strengthActivity =
    getStrengthActivity(
      activities
    );

  const runActivity =
    getRunActivity(
      activities
    );

  const walkActivity =
    getWalkActivity(
      activities
    );

  const mobilityActivity =
    getMobilityActivity(
      activities
    );

  const recoveryDay =
    hasRecoveryActivity(
      activities
    );

  const aerialDay =
    hasAerialActivity(
      activities
    );


  // ==========================================================
  // Incomplete Morning Check-In
  // ==========================================================

  if (!hasReadiness) {

    // --------------------------------------------------------
    // Strength
    // --------------------------------------------------------

    if (strengthActivity) {
      const workoutName =
        strengthActivity.strengthWorkout ??
        strengthActivity.label;

      return {
        title:
          "Today's Training",

        message:
          `${workoutName} is scheduled today. Complete your Morning Check-In for a recovery-aware recommendation.`,

        button:
          `Start ${workoutName}`,

        href:
          "/workout",
      };
    }


    // --------------------------------------------------------
    // Running
    // --------------------------------------------------------

    if (runActivity) {
      return {
        title:
          "Today's Run",

        message:
          `${runActivity.label} is scheduled today. Complete your Morning Check-In for a recovery-aware recommendation.`,

        button:
          "Start Running",

        href:
          "/running",
      };
    }


    // --------------------------------------------------------
    // Aerial
    // --------------------------------------------------------

    if (aerialDay) {
      return {
        title:
          "Aerial Day",

        message:
          "Aerial is scheduled today. Complete your Morning Check-In for a recovery-aware recommendation.",
      };
    }


    // --------------------------------------------------------
    // Walk / Mobility
    // --------------------------------------------------------

    if (
      walkActivity ||
      mobilityActivity
    ) {
      const activityLabels =
        [
          walkActivity?.label,
          mobilityActivity?.label,
        ]
          .filter(Boolean)
          .join(" + ");

      return {
        title:
          "Active Recovery",

        message:
          `${activityLabels} ${walkActivity && mobilityActivity ? "are" : "is"} scheduled today. Complete your Morning Check-In for a recovery-aware recommendation.`,
      };
    }


    // --------------------------------------------------------
    // Recovery
    // --------------------------------------------------------

    if (recoveryDay) {
      return {
        title:
          "Recovery Day",

        message:
          "Today is programmed for recovery. Complete your Morning Check-In to track your recovery and readiness.",
      };
    }


    // --------------------------------------------------------
    // No Formal Training
    // --------------------------------------------------------

    return {
      title:
        "Morning Check-In",

      message:
        "Complete your Morning Check-In to assess today's readiness.",
    };
  }


// ==========================================================
// Walk / Mobility / Active Recovery Day
// ==========================================================

if (
  (walkActivity || mobilityActivity) &&
  !strengthActivity &&
  !runActivity &&
  !aerialDay
) {
  const activityLabels =
    [
      walkActivity?.label,
      mobilityActivity?.label,
    ]
      .filter(Boolean)
      .join(" + ");

  if (
    readiness.status === "low" ||
    readiness.status === "very-low"
  ) {
    return {
      title:
        "Recovery Focus",

      message:
        readinessContext
          ? `${readinessContext} Stick with today's ${activityLabels}. Keep the movement comfortable and use the session to support recovery rather than adding training stress.`
          : `Your readiness is reduced today. Stick with today's ${activityLabels}, keep the movement comfortable, and focus on recovery.`,
    };
  }

  if (
    readiness.status === "normal"
  ) {
    return {
      title:
        "Active Recovery",

      message:
        readinessContext
          ? `${readinessContext} Complete today's ${activityLabels} as planned. Keep the effort easy and use the lighter day to support your next training session.`
          : `Complete today's ${activityLabels} as planned. Keep the effort easy and use the lighter day to support your next training session.`,
    };
  }

  if (
    readiness.status === "high"
  ) {
    return {
      title:
        "Active Recovery",

      message:
        `You're well recovered, but today's ${activityLabels} are intentionally light. Complete them as planned rather than adding unnecessary training volume.`,
    };
  }

  return {
    title:
      "Active Recovery",

    message:
      `Today's schedule calls for ${activityLabels}. Keep the effort easy and use the lighter day to support recovery.`,
  };
}


// ==========================================================
// Recovery / Rest Day
// ==========================================================

if (
  recoveryDay &&
  !strengthActivity &&
  !runActivity &&
  !aerialDay
) {

  // --------------------------------------------------------
  // Low / Very Low Readiness
  // --------------------------------------------------------

  if (
    readiness.status === "low" ||
    readiness.status === "very-low"
  ) {
    return {
      title:
        "Recovery Day",

      message:
        readinessContext
          ? `${readinessContext} Today's recovery day is well timed. Prioritize rest, nutrition, hydration, and light movement.`
          : "Your schedule already calls for recovery today, which matches your reduced readiness. Prioritize rest, nutrition, hydration, and light movement.",
    };
  }


  // --------------------------------------------------------
  // Normal Readiness
  // --------------------------------------------------------

  if (
    readiness.status === "normal"
  ) {
    return {
      title:
        "Recovery Day",

      message:
        readinessContext
          ? `${readinessContext} Today is intentionally programmed for recovery, so keep activity easy and give your body time to adapt.`
          : "Today is intentionally programmed for recovery. Keep activity easy and give your body time to adapt before the next training session.",
    };
  }


  // --------------------------------------------------------
  // High Readiness
  // --------------------------------------------------------

  if (
    readiness.status === "high"
  ) {
    return {
      title:
        "Stay on Recovery",

      message:
        "You're feeling well recovered, but today is intentionally programmed as a recovery day. Keep activity easy rather than adding an extra training session.",
    };
  }


  // --------------------------------------------------------
  // Fallback
  // --------------------------------------------------------

  return {
    title:
      "Recovery Day",

    message:
      "Today is intentionally programmed for recovery. Keep activity easy and give your body time to adapt before the next training session.",
  };
}


  // ==========================================================
  // Strength Day
  // ==========================================================

  if (strengthActivity) {

    const workoutName =
      strengthActivity.strengthWorkout ??
      strengthActivity.label;

    const strengthWorkout =
      getStrengthWorkout(
        strengthActivity
      );

    const extremeSorenessRegion =
      getSorenessRegion(
        ratings,
        5
      );

    const highSorenessRegion =
      getSorenessRegion(
        ratings,
        4
      ) ??
      (
        ratings.UpperBodySoreness >= 3 &&
        ratings.LowerBodySoreness >= 3
          ? "upper and lower body"
          : undefined
      );

    const moderateSorenessRegion =
      getSorenessRegion(
        ratings,
        3
      );


    // --------------------------------------------------------
    // Extreme Soreness
    // --------------------------------------------------------

    if (extremeSorenessRegion) {
      return {
        title:
          "Recovery Priority",

        message:
          `Your ${extremeSorenessRegion} soreness is very high, and ${workoutName} is a full-body session. Recovery is the safer recommendation today rather than training through severe soreness. You can still view the workout and override this recommendation if the rating does not reflect how you feel when moving.`,

        button:
          strengthWorkout
            ? `View ${workoutName} Options`
            : `View ${workoutName}`,

        href:
          "/workout",

        trainingDecision:
          "recovery",

        strengthWorkout,
      };
    }


    // --------------------------------------------------------
    // Very Low Readiness
    // --------------------------------------------------------

    if (
      readiness.status === "very-low"
    ) {
      const severeRecoveryFlag =
        ratings.Energy === 1 ||
        ratings.Sleep === 1;

      if (severeRecoveryFlag) {
        return {
          title:
            "Recovery Priority",

          message:
            readinessContext
              ? `${readinessContext} ${workoutName} is scheduled today, but very low energy or sleep makes recovery the better priority than forcing the session.`
              : `${workoutName} is scheduled today, but very low energy or sleep makes recovery the better priority than forcing the session.`,

          button:
            strengthWorkout
              ? `View ${workoutName} Options`
              : `View ${workoutName}`,

          href:
            "/workout",

          trainingDecision:
            "recovery",

          strengthWorkout,
        };
      }

      return {
        title:
          "Scale Back Today's Training",

        message:
          readinessContext
            ? `${readinessContext} Readiness is very low overall, but without a severe energy or sleep flag. Use the shortened ${workoutName} session and keep the effort conservative.`
            : `Readiness is very low overall, but without a severe energy or sleep flag. Use the shortened ${workoutName} session and keep the effort conservative.`,

        button:
          strengthWorkout
            ? `Start ${workoutName} - Short`
            : `View ${workoutName}`,

        href:
          "/workout",

        trainingDecision:
          strengthWorkout
            ? "short-workout"
            : undefined,

        strengthWorkout,

        strengthVariant:
          strengthWorkout
            ? "ShortGym"
            : undefined,
      };
    }


    // --------------------------------------------------------
    // Low Readiness
    // --------------------------------------------------------

    if (
      readiness.status === "low"
    ) {
      return {
        title:
          "Reduce Training Volume",

        message:
          readinessContext
            ? `${readinessContext} You're scheduled for ${workoutName}, so use the shortened version today and keep the work controlled.`
            : `You're scheduled for ${workoutName} today, but overall readiness is reduced. Use the shortened version and keep the work controlled.`,

        button:
          strengthWorkout
            ? `Start ${workoutName} - Short`
            : `View ${workoutName}`,

        href:
          "/workout",

        trainingDecision:
          strengthWorkout
            ? "short-workout"
            : undefined,

        strengthWorkout,

        strengthVariant:
          strengthWorkout
            ? "ShortGym"
            : undefined,
      };
    }


    // --------------------------------------------------------
    // High / Combined Soreness With Otherwise Adequate Readiness
    // --------------------------------------------------------

    if (highSorenessRegion) {
      return {
        title:
          "Reduce Training Volume",

        message:
          `Your ${highSorenessRegion} soreness is high, and ${workoutName} is a full-body session. Use the shortened workout today, keep effort conservative, and avoid movements that aggravate the sore area.`,

        button:
          strengthWorkout
            ? `Start ${workoutName} - Short`
            : `View ${workoutName}`,

        href:
          "/workout",

        trainingDecision:
          strengthWorkout
            ? "short-workout"
            : undefined,

        strengthWorkout,

        strengthVariant:
          strengthWorkout
            ? "ShortGym"
            : undefined,
      };
    }


    // --------------------------------------------------------
    // Moderate Localized Soreness
    // --------------------------------------------------------

    if (moderateSorenessRegion) {
      return {
        title:
          "Train With Modifications",

        message:
          `Your ${moderateSorenessRegion} soreness is noticeable, but your overall readiness supports training. Complete ${workoutName} as planned and keep the unaffected work. ${getSorenessGuidance(moderateSorenessRegion)}`,

        button:
          `Start ${workoutName}`,

        href:
          "/workout",

        trainingDecision:
          "as-planned",

        strengthWorkout,

        strengthVariant:
          strengthWorkout
            ? "FullGym"
            : undefined,
      };
    }


    // --------------------------------------------------------
    // Normal Readiness
    // --------------------------------------------------------

    if (
      readiness.status === "normal"
    ) {
      return {
        title:
          "Ready to Train",

        message:
          readinessContext
            ? `${readinessContext} You can complete ${workoutName} as planned, but keep those recovery markers in mind and let the progression system determine today's targets.`
            : `You're ready for ${workoutName} today. Follow the programmed session and let the progression system determine today's targets.`,

        button:
          `Start ${workoutName}`,

        href:
          "/workout",

        trainingDecision:
          "as-planned",

        strengthWorkout,

        strengthVariant:
          strengthWorkout
            ? "FullGym"
            : undefined,
      };
    }


    // --------------------------------------------------------
    // High Readiness
    // --------------------------------------------------------

    if (
      readiness.status === "high"
    ) {
      return {
        title:
          "Ready to Train",

        message:
          `You're well recovered for ${workoutName} today. Follow the programmed targets and use the extra readiness to execute the session with high quality.`,

        button:
          `Start ${workoutName}`,

        href:
          "/workout",

        trainingDecision:
          "as-planned",

        strengthWorkout,

        strengthVariant:
          strengthWorkout
            ? "FullGym"
            : undefined,
      };
    }


    // --------------------------------------------------------
    // Fallback
    // --------------------------------------------------------

    return {
      title:
        "Stay Consistent",

      message:
        `You're in a good position to complete ${workoutName} today. Follow the programmed targets and focus on quality reps.`,

      button:
        `Start ${workoutName}`,

      href:
        "/workout",

      trainingDecision:
        "as-planned",

      strengthWorkout,

      strengthVariant:
        strengthWorkout
          ? "FullGym"
          : undefined,
    };
  }


// ==========================================================
// Running / Cardio Day
// ==========================================================

if (runActivity) {

  // --------------------------------------------------------
  // Low / Very Low Readiness
  // --------------------------------------------------------

  if (
    readiness.status === "low" ||
    readiness.status === "very-low"
  ) {
    return {
      title:
        "Keep It Easy",

      message:
        readinessContext
          ? `${readinessContext} You're scheduled for ${runActivity.label}, so keep the effort easy and shorten the session if needed.`
          : `You're scheduled for ${runActivity.label} today, but overall readiness is reduced. Keep the effort easy and shorten the session if needed.`,

      button:
        "View Running",

      href:
        "/running",
    };
  }


  // --------------------------------------------------------
  // Normal Readiness
  // --------------------------------------------------------

  if (
    readiness.status === "normal"
  ) {
    return {
      title:
        "Ready to Run",

      message:
        readinessContext
          ? `${readinessContext} You can complete ${runActivity.label} as planned, but keep those recovery markers in mind and stay within the prescribed effort.`
          : `You're ready for ${runActivity.label} today. Follow the prescribed intensity and duration.`,

      button:
        "Start Running",

      href:
        "/running",
    };
  }


  // --------------------------------------------------------
  // High Readiness
  // --------------------------------------------------------

  if (
    readiness.status === "high"
  ) {
    return {
      title:
        "Ready to Run",

      message:
        `You're well recovered for today's ${runActivity.label}. Follow the scheduled intensity rather than turning an easier session into a harder one.`,

      button:
        "Start Running",

      href:
        "/running",
    };
  }


  // --------------------------------------------------------
  // Fallback
  // --------------------------------------------------------

  return {
    title:
      "Stay on Plan",

    message:
      `Today's schedule calls for ${runActivity.label}. Keep the effort aligned with the prescribed intensity and duration.`,

    button:
      "Start Running",

    href:
      "/running",
  };
}


// ==========================================================
// Aerial Day
// ==========================================================

if (aerialDay) {

  // --------------------------------------------------------
  // Low / Very Low Readiness
  // --------------------------------------------------------

  if (
    readiness.status === "low" ||
    readiness.status === "very-low"
  ) {
    return {
      title:
        "Prioritize Technique",

      message:
        readinessContext
          ? `${readinessContext} Aerial is scheduled today, so keep the session technique-focused and avoid unnecessary high-effort attempts.`
          : "Aerial is scheduled today, but overall readiness is reduced. Keep the session technique-focused and avoid unnecessary high-effort attempts.",
    };
  }


  // --------------------------------------------------------
  // Normal Readiness
  // --------------------------------------------------------

  if (
    readiness.status === "normal"
  ) {
    return {
      title:
        "Aerial Day",

      message:
        readinessContext
          ? `${readinessContext} You can complete aerial as planned, but keep those recovery markers in mind and prioritize controlled, high-quality movement.`
          : "You're ready for aerial today. Focus on skill quality, controlled movement, and consistent practice.",
    };
  }


  // --------------------------------------------------------
  // High Readiness
  // --------------------------------------------------------

  if (
    readiness.status === "high"
  ) {
    return {
      title:
        "Ready for Aerial",

      message:
        "You're well recovered for aerial today. Follow the planned session and use the extra readiness for high-quality skill work rather than unnecessary fatigue.",
    };
  }


  // --------------------------------------------------------
  // Fallback
  // --------------------------------------------------------

  return {
    title:
      "Aerial Day",

    message:
      "Aerial is on today's schedule. Focus on skill quality, controlled movement, and consistent practice.",
  };
}


  // ==========================================================
  // No Formal Training
  // ==========================================================

  return {
    title:
      "Keep Moving",

    message:
      "No formal training session is scheduled today. Focus on your daily movement, nutrition, and recovery goals.",
  };
}


// ============================================================
// Completed Review Context
// ============================================================

function getReviewContextSummary(
  reviewContext: CoachReviewContext
) {
  const decision =
    reviewContext.finalShouldAdvance
      ? "The plan advanced after the last completed weekly review."
      : "The plan was held after the last completed weekly review.";

  const override =
    reviewContext.manuallyOverridden
      ? reviewContext.overrideReason
        ? ` You overrode the automatic result: ${reviewContext.overrideReason}`
        : " You overrode the automatic result."
      : "";

  return {
    label:
      `Week of ${reviewContext.weekStartDate}`,

    message:
      `${decision} ${reviewContext.automaticReason}${override}`,
  };
}


// ============================================================
// Coach Recommendation
// ============================================================

export function getCoachRecommendation(
  ratings: MorningCheckInRatings,
  activities: TrainingActivity[] = [],
  reviewContext?: CoachReviewContext,
  trainingContext?: CoachTrainingContext,
  patternContext?: CoachReviewContextSummary,
  lifestyleContext?: CoachReviewContextSummary,
  preferenceContext?: CoachPreferenceContext
): CoachRecommendation {
  const allScheduledTrainingComplete =
    trainingContext !==
      undefined &&
    trainingContext
      .scheduledActionableCount >
      0 &&
    trainingContext
      .completedActionableCount >=
      trainingContext
        .scheduledActionableCount;

  const recommendation:
    CoachRecommendation =
    allScheduledTrainingComplete
      ? {
          title:
            "Training Complete",

          message:
            "Today's scheduled training is complete. Focus on recovery and the remaining daily targets rather than starting the session again.",
        }
      : getDailyCoachRecommendation(
          ratings,
          getPreferenceRankedOptionalActivities(activities, preferenceContext)
        );

  if (!reviewContext && !patternContext && !lifestyleContext) {
    return recommendation;
  }

  return {
    ...recommendation,

    observations: [
      ...(reviewContext
        ? [
            {
              type: "CompletedReview" as const,
              ...getReviewContextSummary(reviewContext),
            },
          ]
        : []),
      ...(patternContext
        ? [
            {
              type: "PersistentPattern" as const,
              ...patternContext,
            },
          ]
        : []),
      ...(lifestyleContext
        ? [
            {
              type: "LifestyleContext" as const,
              ...lifestyleContext,
            },
          ]
        : []),
    ],
  };
}
