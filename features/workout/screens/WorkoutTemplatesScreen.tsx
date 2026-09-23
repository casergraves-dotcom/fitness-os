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
import { useCoachingPreferences } from "@/features/coach/hooks/useCoachingPreferences";
import { useBodyCompositionGoals } from "@/features/progress/hooks/useBodyCompositionGoals";

import AddExercise from "../components/AddExercise";

import {
  useWorkoutTemplates,
} from "../hooks/useWorkoutTemplates";
import { useWorkoutHistory } from "../hooks/useWorkoutHistory";
import { getStrengthProgrammingProfile } from "../strengthProgrammingProfile";
import { getStrengthProgrammingRecommendation } from "../logic/getStrengthProgrammingRecommendation";

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
  } = useWorkoutTemplates();

  // ----------------------------------------------------------
  // Selected Workout
  // ----------------------------------------------------------

  const [
    selectedWorkout,
    setSelectedWorkout,
  ] = useState<StrengthWorkoutType>("Gym A");

  // ----------------------------------------------------------
  // Selected Workout Exercises
  // ----------------------------------------------------------

  const exercises =
    templates[selectedWorkout];

  const programmingProfile = currentGoal
    ? getStrengthProgrammingProfile({
        primaryGoal: currentGoal.primaryGoal,
        trainingEmphasis: coachingPreferences.trainingEmphasis,
      })
    : null;

  const completedFullSessionsForWorkout = workoutHistory.filter(
    (session) =>
      session.workoutType === selectedWorkout &&
      Boolean(session.completedAt) &&
      (session.variantType === undefined || session.variantType === "FullGym")
  ).length;

  const programmingAssessment = programmingProfile
    ? getStrengthProgrammingRecommendation({
        workoutType: selectedWorkout,
        template: exercises,
        profile: programmingProfile,
        completedFullSessionsForWorkout,
        recoverySupportsBuild: false,
        recoveryCallsForReduction: false,
        recommendationId: `preview-${selectedWorkout.toLowerCase().replace(" ", "-")}`,
        createdAt: "preview",
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

        {coachingPreferencesLoaded && goalsLoaded && workoutHistoryLoaded ? (
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
                      {completedFullSessionsForWorkout} completed full {selectedWorkout} {completedFullSessionsForWorkout === 1 ? "session" : "sessions"} recorded.
                    </p>
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
                          Preview only—applying recommendations is not enabled yet.
                        </p>
                      </div>
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
                onClick={() =>
                  setSelectedWorkout(
                    workoutType
                  )
                }
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
      </div>
    </AppShell>
  );
}
