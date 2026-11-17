import type {
  ActivityBarrierFeedback,
  ActivityBarrierReason,
} from "./coachingPreferences";
import type { WeeklyDecisionPattern } from "./getWeeklyDecisionPattern";

export interface ActivityBarrierPrompt {
  activityId: string;
  activityLabel: string;
  question: string;
  feedback?: ActivityBarrierFeedback;
}

export const ACTIVITY_BARRIER_OPTIONS: Array<{
  reason: Exclude<ActivityBarrierReason, "NotNow">;
  label: string;
}> = [
  { reason: "Boredom", label: "It feels repetitive" },
  { reason: "Scheduling", label: "Scheduling conflict" },
  { reason: "LimitedTime", label: "Not enough time" },
  { reason: "Difficulty", label: "It feels too difficult" },
  { reason: "Fatigue", label: "Fatigue or recovery" },
  { reason: "PreferAlternative", label: "I prefer another activity" },
  { reason: "PrioritiesChanged", label: "My priorities changed" },
];

export function getActivityBarrierPrompt(
  pattern: WeeklyDecisionPattern | null,
  feedback: ActivityBarrierFeedback[]
): ActivityBarrierPrompt | null {
  const blocker = pattern?.recurringBlocker;
  if (
    !blocker ||
    pattern.intentionalRepeat ||
    (pattern.repeatedProgramWeekCount ?? pattern.consecutiveReviewCount) < 2
  ) {
    return null;
  }

  const savedFeedback = feedback.find(
    (item) => item.activityId === blocker.activityId
  );

  if (savedFeedback?.reason === "NotNow") {
    return null;
  }

  return {
    activityId: blocker.activityId,
    activityLabel: blocker.label,
    question: `${blocker.label} has been difficult to complete lately. What's getting in the way?`,
    feedback: savedFeedback,
  };
}

export function getActivityBarrierGuidance(reason: ActivityBarrierReason): string | null {
  switch (reason) {
    case "Boredom":
      return "Guide will favor compatible formats and variety while preserving the same training objective.";
    case "Scheduling":
      return "Use flexible weekly choices or move this activity to a safer day; the underlying objective stays the same.";
    case "LimitedTime":
      return "Guide will favor a shorter valid option when one exists rather than treating all-or-nothing completion as the only choice.";
    case "Difficulty":
      return "Keep the current progression level and review an easier valid format before adding difficulty.";
    case "Fatigue":
      return "Recovery and recent training load should be reviewed before this activity is pushed again.";
    case "PreferAlternative":
      return "Guide will look for a compatible alternative without treating it as running-specific progress unless it truly is.";
    case "PrioritiesChanged":
      return "Review Training Preferences before changing weekly requirements; Guide will not silently rewrite the program.";
    case "NotNow":
      return null;
  }
}
