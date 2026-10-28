"use client";

// ============================================================
// Imports
// ============================================================

import {
  useState,
} from "react";

import {
  ArrowDown,
  ArrowUp,
  Trash2,
} from "lucide-react";

import AppShell from "@/components/layout/AppShell";
import { ModalBody, ModalFooter, ModalHeader, ModalShell } from "@/components/ui/ModalShell";
import { useCoachingPreferences } from "@/features/coach/hooks/useCoachingPreferences";
import { useBodyCompositionGoals } from "@/features/progress/hooks/useBodyCompositionGoals";
import { useMorningCheckIn } from "@/features/recovery";
import {
  addTrainingWeekDays,
  formatLocalCalendarDate,
  getTrainingWeekStart,
  getTrainingWeekStartDate,
} from "@/lib/date/trainingWeek";

import AddExercise from "../components/AddExercise";

import {
  useWorkoutTemplates,
} from "../hooks/useWorkoutTemplates";
import { useWorkoutHistory } from "../hooks/useWorkoutHistory";
import { useStrengthProgrammingDecisions } from "../hooks/useStrengthProgrammingDecisions";
import { getStrengthProgrammingProfile } from "../strengthProgrammingProfile";
import {
  getStrengthProgrammingRecommendation,
  hasRecentMissedTrainingHold,
} from "../logic/getStrengthProgrammingRecommendation";
import { getStrengthProgrammingEvidence } from "../logic/getStrengthProgrammingEvidence";
import { useTrainingPlanState } from "../hooks/useTrainingPlanState";
import { getEquipmentProfileForDate } from "../logic/getTrainingParticipationPreferenceForDate";
import { getFixedCommitmentProgrammingConstraints } from "../logic/getFixedCommitmentProgrammingConstraints";
import { getTrainingScheduleForDate } from "../utils/getTrainingScheduleForDate";
import { fitnessOsTrainingPlan } from "../trainingPlan";
import {
  currentGymWorkoutCapabilities,
  currentGymWorkoutEquipment,
} from "../backupWorkoutModel";
import { evaluateWeeklyRecovery } from "../logic/evaluateWeeklyRecovery";
import { applyStrengthProgrammingRecommendation } from "../logic/strengthProgrammingRecommendation";
import {
  getWorkoutRotationVolumeAudit,
  getWorkoutVolumeAudit,
} from "../getWorkoutVolumeAudit";

import type {
    StrengthWorkoutType,
} from "../types";

function formatGoal(goal: string) {
  if (goal === "FatLoss") return "Fat Loss";
  if (goal === "BodyComposition") return "Body Composition";
  return goal;
}

function formatMovementRole(role: string) {
  return role.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function formatVolumeBias(bias: "Conserve" | "Standard" | "Build") {
  if (bias === "Conserve") return "Conserve recoverable volume";
  if (bias === "Build") return "Build gradually when evidence supports it";
  return "Maintain standard volume";
}

// ============================================================
// Workout Template Screen
// ============================================================

export default function WorkoutTemplatesScreen() {
  const {
    preferences: coachingPreferences,
    loaded: coachingPreferencesLoaded,
  } = useCoachingPreferences();
  const {
    currentGoal,
    loaded: goalsLoaded,
  } = useBodyCompositionGoals();
  const {
    history: workoutHistory,
    loaded: workoutHistoryLoaded,
  } = useWorkoutHistory();
  const {
    history: morningCheckInHistory,
    loaded: morningCheckInsLoaded,
  } = useMorningCheckIn();
  const {
    decisions: programmingDecisions,
    loaded: programmingDecisionsLoaded,
    recordDecision,
  } = useStrengthProgrammingDecisions();
  const {
    state: trainingPlanState,
    trainingPreferences,
    loaded: trainingPreferencesLoaded,
  } = useTrainingPlanState();
  // ----------------------------------------------------------
  // Template Data
  // ----------------------------------------------------------

  const {
    templates,
    loaded,
    addExercise,
    removeExercise,
    moveExercise,
    updateExerciseSetCount,
    saveTemplates,
  } = useWorkoutTemplates();

  // ----------------------------------------------------------
  // Selected Workout
  // ----------------------------------------------------------

  const [
    selectedWorkout,
    setSelectedWorkout,
  ] = useState<StrengthWorkoutType>("Gym A");
  const [reviewingRecommendation, setReviewingRecommendation] = useState(false);
  const [appliedMessage, setAppliedMessage] = useState<string | null>(null);

  // ----------------------------------------------------------
  // Selected Workout Exercises
  // ----------------------------------------------------------

  const exercises =
    templates[selectedWorkout];

  const volumeAudit = getWorkoutVolumeAudit(exercises, undefined, selectedWorkout);
  const rotationVolumeAudit = getWorkoutRotationVolumeAudit(templates);

  const programmingProfile = currentGoal
    ? getStrengthProgrammingProfile({
        primaryGoal: currentGoal.primaryGoal,
        trainingEmphasis: coachingPreferences.trainingEmphasis,
      })
    : null;

  const {
    completedFullSessionsTotal: completedFullSessionsForWorkout,
    completedFullSessionsSinceDecision,
    latestDecision: latestProgrammingDecision,
  } = getStrengthProgrammingEvidence(
    selectedWorkout,
    workoutHistory,
    programmingDecisions
  );

  const weeklyRecovery = evaluateWeeklyRecovery(
    getTrainingWeekStartDate(new Date()),
    morningCheckInHistory
  );
  const gymEquipmentProfile = getEquipmentProfileForDate(
    trainingPreferences,
    formatLocalCalendarDate(new Date()),
    "Gym",
    {
      equipment: currentGymWorkoutEquipment,
      capabilities: currentGymWorkoutCapabilities,
    }
  );
  const currentWeekStart = getTrainingWeekStart(new Date());
  const currentWeekSchedules = trainingPlanState
    ? Array.from({ length: 7 }, (_, index) =>
        getTrainingScheduleForDate(
          fitnessOsTrainingPlan,
          trainingPlanState,
          addTrainingWeekDays(currentWeekStart, index)
        )
      ).filter((schedule) => schedule !== null)
    : [];
  const fixedCommitmentConstrainedRoles =
    getFixedCommitmentProgrammingConstraints(
      selectedWorkout,
      currentWeekSchedules
    );

  const programmingAssessment = programmingProfile
    ? getStrengthProgrammingRecommendation({
        workoutType: selectedWorkout,
        template: exercises,
        profile: programmingProfile,
        completedFullSessionsForWorkout: completedFullSessionsSinceDecision,
        recoverySupportsBuild: weeklyRecovery.status === "Supported",
        recoveryCallsForReduction: weeklyRecovery.status === "Poor",
        availableEquipment: gymEquipmentProfile.equipment,
        fixedCommitmentConstrainedRoles,
        recentRequiredTrainingMissed: hasRecentMissedTrainingHold(
          trainingPlanState?.weeklyProgressionDecisions ?? []
        ),
        recommendationId: `goal-aware-${selectedWorkout.toLowerCase().replace(" ", "-")}-${completedFullSessionsForWorkout}`,
        createdAt: new Date().toISOString(),
      })
    : null;

  // ----------------------------------------------------------
  // Loading
  // ----------------------------------------------------------

  // Wait until localStorage has been checked before
  // displaying the workout templates.
  if (!loaded) {
    return (
      <AppShell>
        <div className="py-12 text-center text-slate-500">
          Loading workouts...
        </div>
      </AppShell>
    );
  }

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  return (
    <AppShell>
      <div className="space-y-6">
        {/* --------------------------------------------------
            Page Header
        --------------------------------------------------- */}

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Settings
          </p>

          <h1 className="mt-1 text-2xl font-bold">
            Edit Workouts
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Customize your workout templates.
          </p>
        </div>

        {coachingPreferencesLoaded && goalsLoaded && workoutHistoryLoaded && morningCheckInsLoaded && programmingDecisionsLoaded && trainingPreferencesLoaded ? (
          <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
              Goal-aware programming
            </p>

            {programmingProfile ? (
              <div className="mt-3 space-y-3 text-sm text-slate-700">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Active goal</p>
                    <p className="mt-1 font-semibold text-slate-900">{formatGoal(programmingProfile.primaryGoal)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Training emphasis</p>
                    <p className="mt-1 font-semibold text-slate-900">{programmingProfile.trainingEmphasis}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Volume direction</p>
                    <p className="mt-1 font-semibold text-slate-900">{formatVolumeBias(programmingProfile.volumeBias)}</p>
                  </div>
                </div>

                {programmingProfile.priorityMovementRoles.length > 0 ? (
                  <p>
                    <span className="font-semibold text-slate-900">Programming priorities:</span>{" "}
                    {programmingProfile.priorityMovementRoles.map(formatMovementRole).join(", ")}.
                  </p>
                ) : null}

                {programmingProfile.fatigueConstraints.map((constraint) => (
                  <p key={constraint} className="text-amber-900">
                    <span className="font-semibold">Safeguard:</span> {constraint}
                  </p>
                ))}

                <p className="border-t border-blue-200 pt-3 text-slate-600">
                  Your saved Gym A, B, and C templates have not changed. Fitness OS will show each proposed change and require your approval before applying it.
                </p>

                {programmingAssessment ? (
                  <div className="rounded-xl border border-blue-200 bg-white/70 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900">
                        {selectedWorkout} assessment
                      </p>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                        {programmingAssessment.status === "Ready"
                          ? "Ready for review"
                          : programmingAssessment.status === "InsufficientEvidence"
                            ? "Collecting evidence"
                            : "No change"}
                      </span>
                    </div>
                    <p className="mt-2 text-slate-700">
                      {programmingAssessment.explanation}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {completedFullSessionsSinceDecision} completed full {selectedWorkout} {completedFullSessionsSinceDecision === 1 ? "session" : "sessions"} available for this review
                      {latestProgrammingDecision ? ` since the last applied change (${completedFullSessionsForWorkout} total)` : ""}.
                    </p>
                    {weeklyRecovery.factor ? (
                      <p className="mt-1 text-xs text-slate-500">
                        {weeklyRecovery.factor}
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-slate-500">
                        No complete recovery check-in is available for this training week.
                      </p>
                    )}
                    {programmingAssessment.recommendation ? (
                      <div className="mt-3 border-t border-blue-100 pt-3">
                        <p className="font-semibold text-slate-900">
                          {programmingAssessment.recommendation.summary}
                        </p>
                        {programmingAssessment.recommendation.changes.map((change) => (
                          <p key={change.exerciseId} className="mt-1">
                            {change.exerciseName}: {change.currentSetCount} → {change.proposedSetCount} sets. {change.reason}
                          </p>
                        ))}
                        <p className="mt-2 text-xs font-medium text-slate-600">
                          Reassess after {programmingAssessment.recommendation.reassessAfterCompletedStrengthSessions} completed strength sessions.
                        </p>
                        <button
                          type="button"
                          onClick={() => setReviewingRecommendation(true)}
                          className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                        >
                          Review Recommendation
                        </button>
                      </div>
                    ) : null}
                    {appliedMessage ? (
                      <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                        {appliedMessage}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-700">
                Set an active goal in Goals &amp; Targets to create a programming profile. Your workout templates remain unchanged.
              </p>
            )}
          </section>
        ) : null}

        {/* --------------------------------------------------
            Workout Selector
        --------------------------------------------------- */}

        <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-slate-900">Full A/B/C rotation review</p>
              <p className="text-xs text-slate-500">
                {rotationVolumeAudit.totalSets} working sets across three templates
              </p>
            </div>
            <span className="text-sm font-semibold text-blue-600 group-open:hidden">View</span>
            <span className="hidden text-sm font-semibold text-blue-600 group-open:inline">Hide</span>
          </summary>
          <div className="border-t border-slate-200 px-4 py-3">
            <p className="text-xs leading-5 text-slate-500">
              This summarizes the complete template rotation, not the activities scheduled in one calendar week.
              Direct-session frequency counts how many of Gym A, B, and C train the muscle as a primary target.
            </p>
            <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[38rem] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Muscle</th>
                    <th className="px-3 py-2">Direct sets</th>
                    <th className="px-3 py-2">Direct sessions</th>
                    <th className="px-3 py-2">Secondary sets</th>
                    <th className="px-3 py-2">Rep ranges</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rotationVolumeAudit.muscleVolume.map((row) => (
                    <tr key={row.muscle}>
                      <th className="px-3 py-2 font-semibold text-slate-800">{row.muscle}</th>
                      <td className="px-3 py-2 text-slate-700">{row.directSets}</td>
                      <td className="px-3 py-2 text-slate-700">{row.directSessionCount} / 3</td>
                      <td className="px-3 py-2 text-slate-700">{row.secondarySets}</td>
                      <td className="px-3 py-2 text-slate-600">
                        {row.repRanges.length > 0 ? row.repRanges.join(" · ") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </details>

        <div className="grid grid-cols-3 gap-2 rounded-2xl border bg-white p-2 shadow-sm">
          {(
            [
              "Gym A",
              "Gym B",
              "Gym C",
            ] as StrengthWorkoutType[]
          ).map((workoutType) => {
            const selected =
              selectedWorkout ===
              workoutType;

            return (
              <button
                key={workoutType}
                type="button"
                onClick={() => {
                  setSelectedWorkout(workoutType);
                  setReviewingRecommendation(false);
                  setAppliedMessage(null);
                }}
                className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
                  selected
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                {workoutType}
              </button>
            );
          })}
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Volume &amp; reps review
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-900">
                {selectedWorkout} prescription
              </h2>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              volumeAudit.reviewCount > 0
                ? "bg-amber-50 text-amber-800"
                : "bg-emerald-50 text-emerald-700"
            }`}>
              {volumeAudit.reviewCount > 0
                ? `${volumeAudit.reviewCount} item${volumeAudit.reviewCount === 1 ? "" : "s"} to review`
                : "Baseline ranges look consistent"}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{volumeAudit.totalSets}</p>
              <p className="text-xs text-slate-500">working sets</p>
            </div>
            <div className="rounded-xl bg-blue-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Primary</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{volumeAudit.primarySets}</p>
              <p className="text-xs text-slate-500">main-lift sets</p>
            </div>
            <div className="rounded-xl bg-violet-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Accessory</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{volumeAudit.accessorySets}</p>
              <p className="text-xs text-slate-500">support sets</p>
            </div>
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            Direct muscles are the primary target of the set. Secondary muscles assist but are not counted as equivalent direct sets.
          </p>

          <p className="mt-2 rounded-xl bg-blue-50 px-3 py-2 text-sm leading-5 text-slate-700">
            <span className="font-semibold text-slate-900">Why the volume differs:</span>{" "}
            {volumeAudit.requiredSets} sets cover this workout&apos;s required movement patterns;
            {" "}{volumeAudit.supportSets} sets provide optional or targeted support. Rep ranges follow
            each exercise&apos;s canonical performance model, so main lifts and targeted accessories do not
            all use the same repetition range.
          </p>

          <div className="mt-3 rounded-xl border border-slate-200 p-3">
            <h3 className="text-sm font-bold text-slate-900">Muscle-volume summary</h3>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {volumeAudit.muscleVolume.map((item) => (
                <div key={item.muscle} className="rounded-lg bg-slate-50 px-3 py-2">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-slate-800">{item.muscle}</p>
                    <p className="whitespace-nowrap text-sm font-semibold text-slate-900">
                      {item.directSets} direct
                    </p>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {item.repRanges.length > 0
                      ? item.repRanges.join(" · ")
                      : "No direct prescription"}
                    {item.secondarySets > 0
                      ? ` · ${item.secondarySets} secondary`
                      : ""}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[46rem] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Exercise</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Prescription</th>
                  <th className="px-3 py-2">Direct</th>
                  <th className="px-3 py-2">Secondary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {volumeAudit.rows.map((row) => (
                  <tr key={row.exerciseId} className={row.needsReview ? "bg-amber-50/60" : undefined}>
                    <th className="px-3 py-2 font-semibold text-slate-800">{row.name}</th>
                    <td className="px-3 py-2 text-slate-600">
                      <span className="block">{row.role}</span>
                      <span className="text-xs text-slate-400">{row.intent}</span>
                    </td>
                    <td className="px-3 py-2 font-medium text-slate-800">
                      <span className="block">{row.setCount} × {row.repRange}</span>
                      <span className="text-xs font-normal text-slate-500">{row.prescriptionFocus}</span>
                    </td>
                    <td className="px-3 py-2 text-slate-600">{row.directMuscles.join(", ") || "Unassigned"}</td>
                    <td className="px-3 py-2 text-slate-600">{row.secondaryMuscles.join(", ") || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* --------------------------------------------------
            Selected Workout
        --------------------------------------------------- */}

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          {/* ------------------------------------------------
              Workout Information
          ------------------------------------------------- */}

          <div>
            <p className="text-sm font-semibold text-slate-500">
              {selectedWorkout.toUpperCase()} WORKOUT
            </p>

            <h2 className="mt-1 text-xl font-bold">
              {exercises.length}{" "}
              {exercises.length === 1
                ? "Exercise"
                : "Exercises"}
            </h2>
          </div>

          {/* ------------------------------------------------
              Exercise List
          ------------------------------------------------- */}

          <div className="mt-5 space-y-2">
            {exercises.map(
              (exercise, index) => (
                <div
                  key={exercise.id}
                  className="flex items-center rounded-xl border border-slate-200 px-4 py-4"
                >
                  {/* ----------------------------------------
                      Exercise Order
                  ----------------------------------------- */}

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500">
                    {index + 1}
                  </div>

                  {/* ----------------------------------------
                      Exercise Information
                  ----------------------------------------- */}

                  <div className="ml-3 min-w-0 flex-1">
                    <p className="font-semibold">
                      {exercise.name}
                    </p>

                    {/* --------------------------------------
                        Default Set Count
                    --------------------------------------- */}

                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-slate-500">
                        Sets
                      </span>

                      {/* Decrease Sets */}

                      <button
                        type="button"
                        disabled={
                          exercise.sets.length <=
                          1
                        }
                        onClick={() =>
                          updateExerciseSetCount(
                            selectedWorkout,
                            exercise.id,
                            exercise.sets
                              .length - 1
                          )
                        }
                        aria-label={`Decrease sets for ${exercise.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-25"
                      >
                        −
                      </button>

                      {/* Current Set Count */}

                      <span className="min-w-5 text-center text-sm font-semibold">
                        {
                          exercise.sets
                            .length
                        }
                      </span>

                      {/* Increase Sets */}

                      <button
                        type="button"
                        disabled={
                          exercise.sets.length >=
                          10
                        }
                        onClick={() =>
                          updateExerciseSetCount(
                            selectedWorkout,
                            exercise.id,
                            exercise.sets
                              .length + 1
                          )
                        }
                        aria-label={`Increase sets for ${exercise.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-25"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* ----------------------------------------
                      Exercise Controls
                  ----------------------------------------- */}

                  <div className="ml-3 flex items-center gap-1">
                    {/* Move Up */}

                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() =>
                        moveExercise(
                          selectedWorkout,
                          exercise.id,
                          "up"
                        )
                      }
                      aria-label={`Move ${exercise.name} up`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-25"
                    >
                      <ArrowUp
                        size={17}
                      />
                    </button>

                    {/* Move Down */}

                    <button
                      type="button"
                      disabled={
                        index ===
                        exercises.length - 1
                      }
                      onClick={() =>
                        moveExercise(
                          selectedWorkout,
                          exercise.id,
                          "down"
                        )
                      }
                      aria-label={`Move ${exercise.name} down`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-25"
                    >
                      <ArrowDown
                        size={17}
                      />
                    </button>

                    {/* Remove Exercise */}

                    <button
                      type="button"
                      onClick={() => {
                        const confirmed =
                          window.confirm(
                            `Remove ${exercise.name} from your ${selectedWorkout} workout?`
                          );

                        if (
                          confirmed
                        ) {
                          removeExercise(
                            selectedWorkout,
                            exercise.id
                          );
                        }
                      }}
                      aria-label={`Remove ${exercise.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2
                        size={17}
                      />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>

          {/* ------------------------------------------------
              Add Exercise
          ------------------------------------------------- */}

          <div className="mt-4">
            <AddExercise
              existingExerciseNames={
                exercises.map(
                  (exercise) =>
                    exercise.name
                )
              }
              onAddExercise={(
                exerciseId,
                exerciseName
              ) => {
                // Store both the permanent Exercise library ID
                // and the display name in the workout template.
                addExercise(
                  selectedWorkout,
                  exerciseId,
                  exerciseName
                );
              }}
            />
          </div>
        </div>

        {reviewingRecommendation && programmingAssessment?.recommendation ? (
          <ModalShell
            labelledBy="programming-review-title"
            describedBy="programming-review-description"
            onBackdropPress={() => setReviewingRecommendation(false)}
          >
            <ModalHeader>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Goal-aware programming
              </p>
              <h2 id="programming-review-title" className="mt-1 text-xl font-bold">
                Review {selectedWorkout} Change
              </h2>
              <p id="programming-review-description" className="mt-2 text-sm text-slate-600">
                {programmingAssessment.recommendation.summary}
              </p>
            </ModalHeader>

            <ModalBody>
              <div className="space-y-3">
                {programmingAssessment.recommendation.changes.map((change) => (
                  <div key={change.exerciseId} className="rounded-xl border border-slate-200 p-4">
                    <p className="font-semibold text-slate-900">{change.exerciseName}</p>
                    <p className="mt-1 text-lg font-bold text-blue-700">
                      {change.currentSetCount} → {change.proposedSetCount} sets
                    </p>
                    <p className="mt-2 text-sm text-slate-600">{change.reason}</p>
                  </div>
                ))}
                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">What happens next</p>
                  <p className="mt-1">
                    This updates only the reviewed {selectedWorkout} template. Completed workout history and progression evidence remain unchanged.
                  </p>
                  <p className="mt-2">
                    Fitness OS will wait for {programmingAssessment.recommendation.reassessAfterCompletedStrengthSessions} more completed strength sessions before reassessing this decision.
                  </p>
                </div>
              </div>
            </ModalBody>

            <ModalFooter className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setReviewingRecommendation(false)}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
              >
                Keep Current Template
              </button>
              <button
                type="button"
                onClick={() => {
                  const recommendation = programmingAssessment.recommendation;
                  if (!recommendation) return;

                  const appliedAt = new Date().toISOString();
                  const updatedExercises = applyStrengthProgrammingRecommendation(
                    exercises,
                    recommendation,
                    {
                      approved: true,
                      createSetId: (exerciseId, setIndex) =>
                        `${exerciseId}-program-${Date.now()}-${setIndex}`,
                    }
                  );

                  saveTemplates({
                    ...templates,
                    [selectedWorkout]: updatedExercises,
                  });
                  recordDecision({
                    id: `${recommendation.id}-${Date.now()}`,
                    workoutType: selectedWorkout,
                    recommendation,
                    completedFullSessionsAtApplication: completedFullSessionsForWorkout,
                    appliedAt,
                  });
                  setReviewingRecommendation(false);
                  setAppliedMessage(`${recommendation.summary} Applied to ${selectedWorkout}.`);
                }}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Apply Change
              </button>
            </ModalFooter>
          </ModalShell>
        ) : null}
      </div>
    </AppShell>
  );
}
