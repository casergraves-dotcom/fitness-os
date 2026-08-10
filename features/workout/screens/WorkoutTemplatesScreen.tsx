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

import AddExercise from "../components/AddExercise";

import {
  useWorkoutTemplates,
} from "../hooks/useWorkoutTemplates";

import type {
    StrengthWorkoutType,
} from "../types";

// ============================================================
// Workout Template Screen
// ============================================================

export default function WorkoutTemplatesScreen() {
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