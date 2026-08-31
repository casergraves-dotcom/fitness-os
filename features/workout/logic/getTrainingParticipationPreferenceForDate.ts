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
