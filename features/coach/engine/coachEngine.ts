import {
  calculateReadiness,
} from "@/features/recovery";

import type {
  MorningCheckInRatings,
} from "@/features/recovery";

import type {
  TrainingActivity,
} from "@/features/workout/types";

import {
  getReadinessContext,
} from "./rules";


// ============================================================
// Coach Recommendation
// ============================================================

export interface CoachRecommendation {
  title: string;
  message: string;

  // Optional because recovery/rest days may not need an action.
  button?: string;

  // Optional destination for the Coach card action.
  href?: string;
}


// ============================================================
// Activity Helpers
// ============================================================

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


// ============================================================
// Coach Engine
// ============================================================

export function getCoachRecommendation(
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
// Recovery / Rest Day
// ==========================================================

if (
  recoveryDay &&
  !strengthActivity &&
  !runActivity
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


    // --------------------------------------------------------
    // Low / Very Low Readiness
    // --------------------------------------------------------

    if (
      readiness.status === "low" ||
      readiness.status === "very-low"
    ) {
      return {
        title:
          "Reduce Intensity",

        message:
          readinessContext
            ? `${readinessContext} You're scheduled for ${workoutName}, so keep the session controlled and prioritize quality movement over pushing performance.`
            : `You're scheduled for ${workoutName} today, but overall readiness is reduced. Keep the session controlled and prioritize quality movement over pushing performance.`,

        button:
          `View ${workoutName}`,

        href:
          "/workout",
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