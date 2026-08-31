import type {
  AerialSessionPreference,
  RunningPreference,
  TrainingEquipmentProfile,
  TrainingSessionDurationPreference,
  TrainingDayOfWeek,
  TrainingModality,
  TrainingParticipationPreference,
  WorkoutEnvironment,
} from "../types";

export const DEFAULT_TRAINING_MODALITIES: TrainingModality[] = [
  "Strength",
  "Run",
  "Aerial",
];

export function getTrainingParticipationPreferenceForDate(
  history: TrainingParticipationPreference[] | undefined,
  date: string
) {
  return [...(history ?? [])]
    .filter((record) => record.effectiveDate <= date)
    .sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate))[0] ?? null;
}

export function getEnabledTrainingModalitiesForDate(
  history: TrainingParticipationPreference[] | undefined,
  date: string
) {
  return (
    getTrainingParticipationPreferenceForDate(history, date)?.enabledModalities ??
    DEFAULT_TRAINING_MODALITIES
  );
}

export function getPreferredTrainingDaysForDate(
  history: TrainingParticipationPreference[] | undefined,
  date: string,
  modality: TrainingModality
): TrainingDayOfWeek[] {
  return getTrainingParticipationPreferenceForDate(history, date)
    ?.preferredDaysByModality?.[modality] ?? [];
}

export function getAerialSessionsForDate(
  history: TrainingParticipationPreference[] | undefined,
  date: string
): AerialSessionPreference[] {
  return getTrainingParticipationPreferenceForDate(history, date)
    ?.aerialSessions ?? [];
}

export const DEFAULT_RUNNING_PREFERENCE: RunningPreference = {
  environment: "Either",
  format: "Either",
};

export function getRunningPreferenceForDate(
  history: TrainingParticipationPreference[] | undefined,
  date: string
): RunningPreference {
  return getTrainingParticipationPreferenceForDate(history, date)
    ?.runningPreference ?? DEFAULT_RUNNING_PREFERENCE;
}

export function getEquipmentProfileForDate(
  history: TrainingParticipationPreference[] | undefined,
  date: string,
  environment: WorkoutEnvironment,
  fallback: TrainingEquipmentProfile
): TrainingEquipmentProfile {
  return getTrainingParticipationPreferenceForDate(history, date)
    ?.equipmentProfiles?.[environment] ?? fallback;
}

export function getSessionDurationPreferenceForDate(
  history: TrainingParticipationPreference[] | undefined,
  date: string,
  modality: TrainingModality
): TrainingSessionDurationPreference {
  return getTrainingParticipationPreferenceForDate(history, date)
    ?.sessionDurationByModality?.[modality] ?? {};
}

const DAY_NAMES: TrainingDayOfWeek[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function getDayOfWeek(date: string): TrainingDayOfWeek | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;
  const value = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (
    value.getFullYear() !== Number(match[1]) ||
    value.getMonth() !== Number(match[2]) - 1 ||
    value.getDate() !== Number(match[3])
  ) {
    return null;
  }
  return DAY_NAMES[value.getDay()];
}

export function getTrainingDayPreferencePenalty(
  history: TrainingParticipationPreference[] | undefined,
  date: string,
  modality: TrainingModality
): number {
  const day = getDayOfWeek(date);
  if (!day) return 0;

  const preference = getTrainingParticipationPreferenceForDate(history, date);
  const preferredDays = preference?.preferredDaysByModality?.[modality] ?? [];
  if (preferredDays.length === 0) return 0;

  if (modality === "Aerial") {
    const fixedDays = (preference?.aerialSessions ?? [])
      .filter((session) => session.constraint === "Fixed")
      .map((session) => session.day);
    if (fixedDays.includes(day)) return 0;
    if (preferredDays.includes(day)) return 1;
    return fixedDays.length > 0 ? 6 : 2;
  }

  return preferredDays.includes(day) ? 0 : 2;
}
