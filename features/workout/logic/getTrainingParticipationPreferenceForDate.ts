import type {
  TrainingDayOfWeek,
  TrainingModality,
  TrainingParticipationPreference,
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
