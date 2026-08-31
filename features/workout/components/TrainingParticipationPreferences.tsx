"use client";

import { useEffect, useMemo, useState } from "react";

import { useTrainingPlanState } from "../hooks/useTrainingPlanState";
import {
  currentGymWorkoutCapabilities,
  currentGymWorkoutEquipment,
  currentHomeWorkoutCapabilities,
  currentHomeWorkoutEquipment,
} from "../backupWorkoutModel";
import {
  DEFAULT_TRAINING_MODALITIES,
  getEnabledTrainingModalitiesForDate,
  getEquipmentProfileForDate,
  getRunningPreferenceForDate,
  getSessionDurationPreferenceForDate,
  getTrainingParticipationPreferenceForDate,
} from "../logic/getTrainingParticipationPreferenceForDate";
import type {
  AerialSessionPreference,
  RunningPreference,
  TrainingEquipmentProfile,
  TrainingSessionDurationPreference,
  TrainingDayOfWeek,
  TrainingModality,
  WorkoutEnvironment,
  WorkoutEquipment,
  WorkoutSetupCapability,
} from "../types";

const OPTIONS: Array<{ value: TrainingModality; label: string; description: string }> = [
  { value: "Strength", label: "Strength training", description: "Gym and home strength sessions." },
  { value: "Run", label: "Running", description: "Scheduled development and endurance runs." },
  { value: "Aerial", label: "Aerial", description: "Aerial sessions and aerial-specific load context." },
];

const DAYS: Array<{ value: TrainingDayOfWeek; label: string }> = [
  { value: "Sunday", label: "Sun" },
  { value: "Monday", label: "Mon" },
  { value: "Tuesday", label: "Tue" },
  { value: "Wednesday", label: "Wed" },
  { value: "Thursday", label: "Thu" },
  { value: "Friday", label: "Fri" },
  { value: "Saturday", label: "Sat" },
];

type PreferredDays = Partial<Record<TrainingModality, TrainingDayOfWeek[]>>;
type EquipmentProfiles = Record<WorkoutEnvironment, TrainingEquipmentProfile>;
type SessionDurations = Partial<Record<TrainingModality, TrainingSessionDurationPreference>>;

const DURATION_OPTIONS = [15, 20, 30, 45, 60, 75, 90, 120];

const EQUIPMENT_OPTIONS: Array<{ value: WorkoutEquipment; label: string }> = [
  { value: "Bodyweight", label: "Bodyweight" },
  { value: "YogaMat", label: "Yoga mat" },
  { value: "ResistanceBands", label: "Resistance bands" },
  { value: "PullUpBar", label: "Pull-up bar" },
  { value: "PunchingBag", label: "Punching bag" },
  { value: "Dumbbells", label: "Dumbbells" },
  { value: "Barbell", label: "Barbell" },
  { value: "BarbellRack", label: "Barbell rack" },
  { value: "WeightPlate", label: "Weight plates" },
  { value: "Bench", label: "Bench" },
  { value: "GymMachines", label: "Gym machines" },
];

const CAPABILITY_OPTIONS: Array<{ value: WorkoutSetupCapability; label: string }> = [
  { value: "FloorSpace", label: "Floor space" },
  { value: "HighAnchor", label: "High band/cable anchor" },
  { value: "LowAnchor", label: "Low band/cable anchor" },
  { value: "DoorAnchor", label: "Door anchor" },
  { value: "PullUpBarInstalled", label: "Installed pull-up bar" },
];

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function TrainingParticipationPreferences() {
  const { state, loaded, setTrainingParticipationPreferences } = useTrainingPlanState();
  const today = formatLocalDate(new Date());
  const current = useMemo(
    () => state
      ? getEnabledTrainingModalitiesForDate(state.trainingParticipationPreferences, today)
      : DEFAULT_TRAINING_MODALITIES,
    [state, today]
  );
  const currentPreferredDays = useMemo(
    () => state
      ? getTrainingParticipationPreferenceForDate(
          state.trainingParticipationPreferences,
          today
        )?.preferredDaysByModality ?? {}
      : {},
    [state, today]
  );
  const currentAerialSessions = useMemo(
    () => state
      ? getTrainingParticipationPreferenceForDate(
          state.trainingParticipationPreferences,
          today
        )?.aerialSessions ?? []
      : [],
    [state, today]
  );
  const currentRunningPreference = useMemo(
    () => state
      ? getRunningPreferenceForDate(
          state.trainingParticipationPreferences,
          today
        )
      : { environment: "Either", format: "Either" } as RunningPreference,
    [state, today]
  );
  const currentEquipmentProfiles = useMemo<EquipmentProfiles>(() => ({
    Home: getEquipmentProfileForDate(
      state?.trainingParticipationPreferences,
      today,
      "Home",
      {
        equipment: currentHomeWorkoutEquipment,
        capabilities: currentHomeWorkoutCapabilities,
      }
    ),
    Gym: getEquipmentProfileForDate(
      state?.trainingParticipationPreferences,
      today,
      "Gym",
      {
        equipment: currentGymWorkoutEquipment,
        capabilities: currentGymWorkoutCapabilities,
      }
    ),
  }), [state, today]);
  const currentSessionDurations = useMemo<SessionDurations>(() => ({
    Strength: getSessionDurationPreferenceForDate(
      state?.trainingParticipationPreferences,
      today,
      "Strength"
    ),
    Run: getSessionDurationPreferenceForDate(
      state?.trainingParticipationPreferences,
      today,
      "Run"
    ),
    Aerial: getSessionDurationPreferenceForDate(
      state?.trainingParticipationPreferences,
      today,
      "Aerial"
    ),
  }), [state, today]);
  const [selected, setSelected] = useState<TrainingModality[]>(current);
  const [preferredDays, setPreferredDays] = useState<PreferredDays>(
    currentPreferredDays
  );
  const [aerialSessions, setAerialSessions] = useState<AerialSessionPreference[]>(
    currentAerialSessions
  );
  const [runningPreference, setRunningPreference] = useState<RunningPreference>(
    currentRunningPreference
  );
  const [equipmentProfiles, setEquipmentProfiles] = useState<EquipmentProfiles>(
    currentEquipmentProfiles
  );
  const [sessionDurations, setSessionDurations] = useState<SessionDurations>(
    currentSessionDurations
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => setSelected(current), [current]);
  useEffect(() => setPreferredDays(currentPreferredDays), [currentPreferredDays]);
  useEffect(() => setAerialSessions(currentAerialSessions), [currentAerialSessions]);
  useEffect(() => setRunningPreference(currentRunningPreference), [currentRunningPreference]);
  useEffect(() => setEquipmentProfiles(currentEquipmentProfiles), [currentEquipmentProfiles]);
  useEffect(() => setSessionDurations(currentSessionDurations), [currentSessionDurations]);

  if (!loaded) {
    return <div className="rounded-2xl border bg-white p-5 shadow-sm text-sm text-slate-500">Loading training preferences...</div>;
  }

  if (!state) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">Training Participation</h2>
        <p className="mt-2 text-sm text-slate-600">Start a training plan before changing participation preferences.</p>
      </div>
    );
  }

  function toggle(value: TrainingModality) {
    setSaved(false);
    setSelected((values) =>
      values.includes(value)
        ? values.filter((item) => item !== value)
        : [...values, value]
    );
  }

  function togglePreferredDay(
    modality: TrainingModality,
    day: TrainingDayOfWeek
  ) {
    setSaved(false);
    setPreferredDays((values) => {
      const currentDays = values[modality] ?? [];
      return {
        ...values,
        [modality]: currentDays.includes(day)
          ? currentDays.filter((item) => item !== day)
          : [...currentDays, day],
      };
    });
  }

  function addAerialSession() {
    setSaved(false);
    setPreferredDays((values) => ({
      ...values,
      Aerial: Array.from(new Set([...(values.Aerial ?? []), "Thursday"])),
    }));
    setAerialSessions((sessions) => [
      ...sessions,
      {
        id: `aerial-${Date.now()}`,
        day: "Thursday",
        sessionType: "Class",
        name: "",
        constraint: "Fixed",
      },
    ]);
  }

  function updateAerialSession(
    id: string,
    changes: Partial<AerialSessionPreference>
  ) {
    setSaved(false);
    setAerialSessions((sessions) =>
      sessions.map((session) =>
        session.id === id ? { ...session, ...changes } : session
      )
    );
    if (changes.day) {
      setPreferredDays((values) => ({
        ...values,
        Aerial: Array.from(new Set([...(values.Aerial ?? []), changes.day!])),
      }));
    }
  }

  function removeAerialSession(id: string) {
    setSaved(false);
    setAerialSessions((sessions) =>
      sessions.filter((session) => session.id !== id)
    );
  }

  function toggleEquipment(
    environment: WorkoutEnvironment,
    equipment: WorkoutEquipment
  ) {
    setSaved(false);
    setEquipmentProfiles((profiles) => {
      const currentItems = profiles[environment].equipment;
      return {
        ...profiles,
        [environment]: {
          ...profiles[environment],
          equipment: currentItems.includes(equipment)
            ? currentItems.filter((item) => item !== equipment)
            : [...currentItems, equipment],
        },
      };
    });
  }

  function toggleCapability(
    environment: WorkoutEnvironment,
    capability: WorkoutSetupCapability
  ) {
    setSaved(false);
    setEquipmentProfiles((profiles) => {
      const currentItems = profiles[environment].capabilities;
      return {
        ...profiles,
        [environment]: {
          ...profiles[environment],
          capabilities: currentItems.includes(capability)
            ? currentItems.filter((item) => item !== capability)
            : [...currentItems, capability],
        },
      };
    });
  }

  function updateSessionDuration(
    modality: TrainingModality,
    field: keyof TrainingSessionDurationPreference,
    rawValue: string
  ) {
    setSaved(false);
    setSessionDurations((values) => {
      const value = rawValue ? Number(rawValue) : undefined;
      const next = { ...(values[modality] ?? {}), [field]: value };
      if (
        field === "typicalMinutes" &&
        value !== undefined &&
        next.maximumMinutes !== undefined &&
        next.maximumMinutes < value
      ) {
        next.maximumMinutes = value;
      }
      if (
        field === "maximumMinutes" &&
        value !== undefined &&
        next.typicalMinutes !== undefined &&
        next.typicalMinutes > value
      ) {
        next.typicalMinutes = value;
      }
      return { ...values, [modality]: next };
    });
  }

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Training participation</p>
      <h2 className="mt-1 text-lg font-bold">Activities in your plan</h2>
      <p className="mt-1 text-sm text-slate-600">Changes apply from today forward. Earlier schedules and adherence remain unchanged.</p>

      <div className="mt-5 space-y-3">
        {OPTIONS.map((option) => {
          const enabled = selected.includes(option.value);
          return (
            <div key={option.value} className="rounded-xl border border-slate-200 p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" checked={enabled} onChange={() => toggle(option.value)} className="mt-1 h-5 w-5" />
                <span>
                  <span className="block font-semibold text-slate-900">{option.label}</span>
                  <span className="mt-1 block text-sm text-slate-500">{option.description}</span>
                </span>
              </label>

              {enabled && (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Preferred days <span className="normal-case font-normal">(optional)</span>
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {DAYS.map((day) => {
                      const active = (preferredDays[option.value] ?? []).includes(day.value);
                      return (
                        <button
                          key={day.value}
                          type="button"
                          aria-pressed={active}
                          onClick={() => togglePreferredDay(option.value, day.value)}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                            active
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-slate-200 bg-white text-slate-600"
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5 grid gap-4 rounded-xl bg-slate-50 p-4 md:grid-cols-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Typical session length
                      <select
                        value={sessionDurations[option.value]?.typicalMinutes ?? ""}
                        onChange={(event) => updateSessionDuration(option.value, "typicalMinutes", event.target.value)}
                        className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-900"
                      >
                        <option value="">No preference</option>
                        {DURATION_OPTIONS.map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes</option>)}
                      </select>
                    </label>
                    <label className="text-sm font-semibold text-slate-700">
                      Maximum time available
                      <select
                        value={sessionDurations[option.value]?.maximumMinutes ?? ""}
                        onChange={(event) => updateSessionDuration(option.value, "maximumMinutes", event.target.value)}
                        className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-900"
                      >
                        <option value="">No limit specified</option>
                        {DURATION_OPTIONS.map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes</option>)}
                      </select>
                    </label>
                  </div>

                  {option.value === "Strength" && (
                    <div className="mt-5 rounded-xl bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">Equipment and setup</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Equipment means it is usable in that location. Setup describes what can be safely installed or anchored there.
                      </p>
                      <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        {(["Home", "Gym"] as WorkoutEnvironment[]).map((environment) => (
                          <details key={environment} open className="rounded-xl border border-slate-200 bg-white p-4">
                            <summary className="cursor-pointer font-semibold text-slate-900">{environment}</summary>
                            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Available equipment</p>
                            <div className="mt-2 grid gap-2 sm:grid-cols-2">
                              {EQUIPMENT_OPTIONS.map((equipmentOption) => (
                                <label key={equipmentOption.value} className="flex items-center gap-2 text-sm text-slate-700">
                                  <input type="checkbox" checked={equipmentProfiles[environment].equipment.includes(equipmentOption.value)} onChange={() => toggleEquipment(environment, equipmentOption.value)} className="h-4 w-4" />
                                  {equipmentOption.label}
                                </label>
                              ))}
                            </div>
                            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Setup capabilities</p>
                            <div className="mt-2 grid gap-2 sm:grid-cols-2">
                              {CAPABILITY_OPTIONS.map((capabilityOption) => (
                                <label key={capabilityOption.value} className="flex items-center gap-2 text-sm text-slate-700">
                                  <input type="checkbox" checked={equipmentProfiles[environment].capabilities.includes(capabilityOption.value)} onChange={() => toggleCapability(environment, capabilityOption.value)} className="h-4 w-4" />
                                  {capabilityOption.label}
                                </label>
                              ))}
                            </div>
                          </details>
                        ))}
                      </div>
                    </div>
                  )}

                  {option.value === "Run" && (
                    <div className="mt-5 grid gap-4 rounded-xl bg-slate-50 p-4 md:grid-cols-2">
                      <label className="text-sm font-semibold text-slate-700">
                        Where do you prefer to run?
                        <select
                          value={runningPreference.environment}
                          onChange={(event) => {
                            setSaved(false);
                            setRunningPreference((value) => ({
                              ...value,
                              environment: event.target.value as RunningPreference["environment"],
                            }));
                          }}
                          className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-900"
                        >
                          <option value="Either">Either outdoor or treadmill</option>
                          <option value="Outdoor">Prefer outdoors</option>
                          <option value="Treadmill">Prefer treadmill</option>
                        </select>
                      </label>

                      <label className="text-sm font-semibold text-slate-700">
                        Preferred running format
                        <select
                          value={runningPreference.format}
                          onChange={(event) => {
                            setSaved(false);
                            setRunningPreference((value) => ({
                              ...value,
                              format: event.target.value as RunningPreference["format"],
                            }));
                          }}
                          className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal text-slate-900"
                        >
                          <option value="Either">No preference</option>
                          <option value="RunWalk">Prefer run/walk intervals</option>
                          <option value="Continuous">Prefer continuous running</option>
                        </select>
                      </label>
                      <p className="text-xs text-slate-500 md:col-span-2">
                        These guide future planning. Recovery and progression safeguards still determine the appropriate prescription.
                      </p>
                    </div>
                  )}

                  {option.value === "Aerial" && (
                    <div className="mt-5 rounded-xl bg-slate-50 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            Recurring aerial sessions
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Distinguish fixed classes from flexible open-studio opportunities.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={addAerialSession}
                          className="rounded-lg border border-blue-600 bg-white px-3 py-2 text-sm font-semibold text-blue-700"
                        >
                          + Add session
                        </button>
                      </div>

                      {aerialSessions.length > 0 && (
                        <div className="mt-4 space-y-3">
                          {aerialSessions.map((session) => (
                            <div key={session.id} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 md:grid-cols-[0.8fr_1fr_1.2fr_1.4fr_auto]">
                              <label className="text-xs font-semibold text-slate-500">
                                Day
                                <select value={session.day} onChange={(event) => updateAerialSession(session.id, { day: event.target.value as TrainingDayOfWeek })} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900">
                                  {DAYS.map((day) => <option key={day.value} value={day.value}>{day.label}</option>)}
                                </select>
                              </label>
                              <label className="text-xs font-semibold text-slate-500">
                                Session
                                <select value={session.sessionType} onChange={(event) => updateAerialSession(session.id, { sessionType: event.target.value as AerialSessionPreference["sessionType"] })} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900">
                                  <option value="Class">Class</option>
                                  <option value="OpenStudio">Open studio</option>
                                </select>
                              </label>
                              <label className="text-xs font-semibold text-slate-500">
                                Name or apparatus
                                <input value={session.name ?? ""} onChange={(event) => updateAerialSession(session.id, { name: event.target.value })} placeholder="e.g. Lyra" className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-900" />
                              </label>
                              <label className="text-xs font-semibold text-slate-500">
                                Scheduling
                                <select value={session.constraint} onChange={(event) => updateAerialSession(session.id, { constraint: event.target.value as AerialSessionPreference["constraint"] })} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900">
                                  <option value="Fixed">Fixed weekly commitment</option>
                                  <option value="Flexible">Flexible opportunity</option>
                                </select>
                              </label>
                              <button type="button" onClick={() => removeAerialSession(session.id)} className="self-end rounded-lg px-3 py-2 text-sm font-medium text-red-600">
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Preferred days guide future planning. They do not move activities already on your schedule.
      </p>

      <div className="mt-5 flex items-center gap-3">
        <button type="button" onClick={() => { setTrainingParticipationPreferences(selected, preferredDays, aerialSessions, runningPreference, equipmentProfiles, sessionDurations); setSaved(true); }} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Save Preferences</button>
        {saved && <span className="text-sm font-medium text-emerald-700">Saved for {today}</span>}
      </div>
    </section>
  );
}
