export type CoachingFocus =
  | "Balanced"
  | "Performance"
  | "Consistency"
  | "Recovery"
  | "Enjoyment";

export type CoachingBalanceLevel =
  | "Lower"
  | "Standard"
  | "Higher";

export type CoachingAdjustmentStyle =
  | "Conservative"
  | "Balanced"
  | "Assertive";

export type CoachingCheckInPrompt =
  | "Daily"
  | "TrainingDays"
  | "Manual";

export interface CoachingPreferences {
  focus: CoachingFocus;
  adjustmentStyle: CoachingAdjustmentStyle;
  checkInPrompt: CoachingCheckInPrompt;
  modalityBalance: {
    strength: CoachingBalanceLevel;
    running: CoachingBalanceLevel;
    activeHobbies: CoachingBalanceLevel;
  };
  updatedAt: string;
}

export const DEFAULT_COACHING_PREFERENCES: CoachingPreferences = {
  focus: "Balanced",
  adjustmentStyle: "Balanced",
  checkInPrompt: "Daily",
  modalityBalance: {
    strength: "Standard",
    running: "Standard",
    activeHobbies: "Standard",
  },
  updatedAt: "",
};

export function normalizeCoachingPreferences(value: unknown): CoachingPreferences {
  if (typeof value !== "object" || value === null) {
    return DEFAULT_COACHING_PREFERENCES;
  }
  const candidate = value as Partial<CoachingPreferences>;
  const focuses: CoachingFocus[] = ["Balanced", "Performance", "Consistency", "Recovery", "Enjoyment"];
  const levels: CoachingBalanceLevel[] = ["Lower", "Standard", "Higher"];
  const adjustmentStyles: CoachingAdjustmentStyle[] = ["Conservative", "Balanced", "Assertive"];
  const checkInPrompts: CoachingCheckInPrompt[] = ["Daily", "TrainingDays", "Manual"];
  const balance = candidate.modalityBalance;
  return {
    focus: focuses.includes(candidate.focus as CoachingFocus)
      ? candidate.focus as CoachingFocus
      : "Balanced",
    adjustmentStyle: adjustmentStyles.includes(candidate.adjustmentStyle as CoachingAdjustmentStyle)
      ? candidate.adjustmentStyle as CoachingAdjustmentStyle
      : "Balanced",
    checkInPrompt: checkInPrompts.includes(candidate.checkInPrompt as CoachingCheckInPrompt)
      ? candidate.checkInPrompt as CoachingCheckInPrompt
      : "Daily",
    modalityBalance: {
      strength: levels.includes(balance?.strength as CoachingBalanceLevel)
        ? balance!.strength
        : "Standard",
      running: levels.includes(balance?.running as CoachingBalanceLevel)
        ? balance!.running
        : "Standard",
      activeHobbies: levels.includes(balance?.activeHobbies as CoachingBalanceLevel)
        ? balance!.activeHobbies
        : "Standard",
    },
    updatedAt: typeof candidate.updatedAt === "string" ? candidate.updatedAt : "",
  };
}

export type CoachingPreferenceArea =
  | "strength"
  | "running"
  | "activeHobbies"
  | "recovery";

export function getCoachingPreferencePriority(
  preferences: CoachingPreferences,
  area: CoachingPreferenceArea
): number {
  const balance = area === "recovery"
    ? 0
    : preferences.modalityBalance[area] === "Higher"
      ? 2
      : preferences.modalityBalance[area] === "Lower"
        ? -1
        : 0;

  const focusBonus =
    preferences.focus === "Performance" && (area === "strength" || area === "running")
      ? 1
      : preferences.focus === "Recovery" && area === "recovery"
        ? 2
        : preferences.focus === "Enjoyment" && area === "activeHobbies"
          ? 1
          : 0;

  return balance + focusBonus;
}
