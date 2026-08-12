"use client";

// ============================================================
// Imports
// ============================================================

import {
  useMemo,
  useState,
} from "react";

import {
  Check,
  MoreVertical,
  RefreshCw,
  Trash2,
  TrendingUp,
} from "lucide-react";

import { Card } from "@/components/ui";

import type {
  Exercise,
} from "../types";

import {
  useExerciseLibrary,
} from "../hooks/useExerciseLibrary";

import {
  getExerciseTarget,
} from "../getExerciseTarget";

import {
  getExerciseSubstitutions,
} from "../exerciseSubstitutions";

import type {
  WorkoutEquipment,
  WorkoutSetupCapability,
} from "../types";

// ============================================================
// Props
// ============================================================

interface ExerciseCardProps {
  exercise: Exercise;

  // Most recent historical performance for this exercise.
  // Undefined means the exercise has never been logged before.
  previousExercise?: Exercise;

  expanded: boolean;

  onToggleSet: (
    exerciseId: string,
    setId: string
  ) => void;

  onUpdateSet: (
    exerciseId: string,
    setId: string,
    field: "weight" | "reps",
    value: number
  ) => void;

  onAddSet: (
    exerciseId: string
  ) => void;

  onRemoveSet: (
    exerciseId: string,
    setId: string
  ) => void;

  onRemoveExercise: (
    exerciseId: string
  ) => void;

  onReplaceExercise: (
    exerciseId: string,
    replacementExerciseDefinitionId: string
  ) => void;
}

// ============================================================
// Exercise Card
// ============================================================

export default function ExerciseCard({
  exercise,
  previousExercise,
  onToggleSet,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
  onReplaceExercise,
}: ExerciseCardProps) {
  // ----------------------------------------------------------
  // State
  // ----------------------------------------------------------

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const [
    substitutionsOpen,
    setSubstitutionsOpen,
  ] = useState(false);

  // ----------------------------------------------------------
  // Exercise Library
  // ----------------------------------------------------------

  const {
    exercises: exerciseLibrary,
  } = useExerciseLibrary();

  // Find the permanent Exercise Library definition for
  // the exercise in today's workout.
  //
  // Prefer the permanent ID. The name fallback keeps
  // older saved workout data working.
  const exerciseDefinition =
    useMemo(() => {
      if (
        exercise.exerciseDefinitionId
      ) {
        const definitionById =
          exerciseLibrary.find(
            (definition) =>
              definition.id ===
              exercise.exerciseDefinitionId
          );

        if (definitionById) {
          return definitionById;
        }
      }

      return exerciseLibrary.find(
        (definition) =>
          definition.name
            .toLowerCase() ===
          exercise.name.toLowerCase()
      );
    }, [
      exercise.exerciseDefinitionId,
      exercise.name,
      exerciseLibrary,
    ]);

  // ----------------------------------------------------------
  // Exercise Substitutions
  // ----------------------------------------------------------

  const substitutionContext =
    useMemo(() => {
      const availableEquipment:
        WorkoutEquipment[] = [
          "Bodyweight",
          "YogaMat",
          "ResistanceBands",
          "Dumbbells",
          "Bench",
          "GymMachines",
        ];

      const availableCapabilities:
        WorkoutSetupCapability[] = [
          "FloorSpace",
          "HighAnchor",
        ];

      return {
        environment:
          "Gym" as const,

        availableEquipment,

        availableCapabilities,

        unavailableExerciseIds:
          exercise.exerciseDefinitionId
            ? [
                exercise.exerciseDefinitionId,
              ]
            : [],
      };
    }, [
      exercise.exerciseDefinitionId,
    ]);

  const substitutionOptions =
    useMemo(
      () =>
        exercise.exerciseDefinitionId
          ? getExerciseSubstitutions(
              exercise.exerciseDefinitionId,
              exerciseLibrary,
              substitutionContext
            )
          : [],
      [
        exercise.exerciseDefinitionId,
        exerciseLibrary,
        substitutionContext,
      ]
    );

  // ----------------------------------------------------------
  // Progression Type
  // ----------------------------------------------------------

  const progressionType =
    exerciseDefinition
      ?.progressionType;

  const isLoad =
    progressionType === "Load";

  const isAssistance =
    progressionType ===
    "Assistance";

  const isReps =
    progressionType === "Reps";

  const isDuration =
    progressionType ===
    "Duration";

  const isWeightDuration =
    exerciseDefinition?.resistanceType === "Weight" &&
    exerciseDefinition?.performanceType === "Duration";

  // Exercises without progression programming continue
  // using the traditional weight × reps interface.
  const usesTraditionalInputs =
    !progressionType ||
    (isLoad && !isWeightDuration);

  // ----------------------------------------------------------
  // Today's Target
  // ----------------------------------------------------------

  const target =
    useMemo(
      () =>
        getExerciseTarget(
          exerciseDefinition,
          previousExercise
        ),
      [
        exerciseDefinition,
        previousExercise,
      ]
    );

  const nextVariation =
    target.action === "next-variation" &&
    target.nextVariationId
      ? exerciseLibrary.find(
          (definition) =>
            definition.id ===
            target.nextVariationId
        )
      : undefined;

  // Don't show a target card for exercises that don't
  // have progression programming yet.
  const showTarget =
    target.action !==
    "no-progression";

  // ----------------------------------------------------------
  // Target Display
  // ----------------------------------------------------------

  // Duration targets should explicitly identify seconds.
  //
  // getExerciseTarget already returns "sec" for historical
  // duration targets, but the no-history target is currently
  // just the numeric range.
  const targetDisplayLabel =
    isDuration &&
    target.repMin !== undefined &&
    target.repMax !== undefined &&
    target.action === "no-history"
      ? `${target.repMin}–${target.repMax} sec`
      : target.label;

  // ----------------------------------------------------------
  // Target Action Label
  // ----------------------------------------------------------

  function getTargetActionLabel() {
    switch (target.action) {
      case "increase-load":
        return "Increase load";

      case "build-reps":
        return "Build reps";

      case "reduce-assistance":
        return "Reduce assistance";

      case "build-duration":
        return "Build duration";

      case "next-variation":
        return "Ready to progress";

      case "repeat":
        return "Repeat target";

      case "review-load":
        return "Review load";

      case "insufficient-data":
        return "Keep current target";

      case "no-history":
        return "Starting target";

      default:
        return "";
    }
  }

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  return (
    <Card className="rounded-2xl border bg-white p-6 shadow-sm">
      {/* ----------------------------------------------------
          Exercise Header
      ----------------------------------------------------- */}

      <div className="relative flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {exercise.name}
        </h2>

        <button
          type="button"
          aria-label={`Options for ${exercise.name}`}
          onClick={() =>
            setMenuOpen(
              (open) => !open
            )
          }
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
        >
          <MoreVertical size={20} />
        </button>

        {/* Exercise options menu */}

        {menuOpen && (
          <div className="absolute right-0 top-11 z-20 w-48 rounded-xl border bg-white p-1 shadow-lg">
            <button
              type="button"
              onClick={() => {
                onRemoveExercise(
                  exercise.id
                );

                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 size={16} />

              Remove Exercise
            </button>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------
          Exercise Substitution
      ----------------------------------------------------- */}

      {substitutionOptions.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() =>
              setSubstitutionsOpen(
                (open) => !open
              )
            }
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <RefreshCw size={15} />

            Need another option?
          </button>

          {substitutionsOpen && (
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Swap Exercise
              </p>

              <div className="mt-2 space-y-2">
                {substitutionOptions.map(
                  (option) => (
                    <button
                      key={
                        option.exercise.id
                      }
                      type="button"
                      onClick={() => {
                        onReplaceExercise(
                          exercise.id,
                          option.exercise.id
                        );

                        setSubstitutionsOpen(
                          false
                        );
                      }}
                      className="flex w-full items-center rounded-lg border border-slate-200 bg-white px-3 py-3 text-left transition hover:border-blue-300 hover:bg-blue-50"
                    >
                      <span className="font-medium text-slate-900">
                        {
                          option.exercise
                            .name
                        }
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------
          Today's Target
      ----------------------------------------------------- */}

      {showTarget && (
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <TrendingUp size={17} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Today&apos;s Target
              </p>

              <p className="mt-1 text-lg font-bold text-slate-900">
                {targetDisplayLabel}
              </p>

              <p className="mt-1 text-sm font-medium text-blue-700">
                {getTargetActionLabel()}
              </p>

              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                {target.action === "next-variation" &&
                nextVariation
                  ? `You mastered the current target. Progress to ${nextVariation.name}.`
                  : target.message}
              </p>

              {target.action === "next-variation" &&
                nextVariation && (
                  <button
                    type="button"
                    onClick={() =>
                      onReplaceExercise(
                        exercise.id,
                        nextVariation.id
                      )
                    }
                    className="mt-3 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                  >
                    Switch to {nextVariation.name}
                  </button>
                )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          Exercise Sets
      ----------------------------------------------------- */}

      <div className="mt-4 space-y-2">
        {exercise.sets.map(
          (set, index) => {
            // Match today's set with the same set number
            // from the most recent historical performance.
            const previousSet =
              previousExercise
                ?.sets[index];

            // ------------------------------------------------
            // Sequential Set Rules
            // ------------------------------------------------

            // A new set can only be completed when every set
            // before it has already been completed.
            const previousSetsComplete =
              exercise.sets
                .slice(0, index)
                .every(
                  (previousSet) =>
                    previousSet.completed
                );

            // A completed set can only be unchecked if there
            // are no completed sets after it.
            const hasCompletedSetAfter =
              exercise.sets
                .slice(index + 1)
                .some(
                  (laterSet) =>
                    laterSet.completed
                );

            const canToggleSet =
              set.completed
                ? !hasCompletedSetAfter
                : previousSetsComplete;

            return (
              <div
                key={set.id}
                className={`flex w-full items-center rounded-xl border p-4 transition-all ${
                  set.completed
                    ? "border-green-400 bg-green-50"
                    : "border-slate-200"
                }`}
              >
                {/* ------------------------------------------
                    Complete Set Button
                ------------------------------------------- */}

                <button
                  type="button"
                  disabled={
                    !canToggleSet
                  }
                  onClick={() =>
                    onToggleSet(
                      exercise.id,
                      set.id
                    )
                  }
                  aria-label={
                    set.completed
                      ? `Uncomplete set ${index + 1}`
                      : `Complete set ${index + 1}`
                  }
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition ${
                    set.completed
                      ? canToggleSet
                        ? "bg-green-500 text-white"
                        : "bg-green-400 text-white opacity-60"
                      : canToggleSet
                        ? "border-2 border-blue-500 bg-blue-50"
                        : "border border-slate-200 bg-slate-50 opacity-50"
                  }`}
                >
                  {set.completed && (
                    <Check
                      size={16}
                    />
                  )}
                </button>

                {/* Set number */}

                <span
                  className={`ml-3 ${
                    set.completed
                      ? "text-slate-400"
                      : ""
                  }`}
                >
                  Set {index + 1}
                </span>

                {/* ==========================================
                    Set Input
                =========================================== */}

                <div className="ml-auto flex flex-col items-end">
                  {/* ----------------------------------------
                      Duration
                  ----------------------------------------- */}

                  {isDuration && (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={1}
                        value={
                          set.reps
                        }
                        disabled={
                          set.completed
                        }
                        onChange={(
                          event
                        ) =>
                          onUpdateSet(
                            exercise.id,
                            set.id,
                            "reps",
                            Math.max(
                              0,
                              Math.floor(
                                Number(
                                  event
                                    .target
                                    .value
                                )
                              )
                            )
                          )
                        }
                        className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center font-medium disabled:bg-transparent disabled:text-slate-400"
                      />

                      <span className="text-sm text-slate-500">
                        sec
                      </span>
                    </div>
                  )}

                  {/* ----------------------------------------
                      Rep-Only / Bodyweight
                  ----------------------------------------- */}

                  {isReps && (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={1}
                        value={
                          set.reps
                        }
                        disabled={
                          set.completed
                        }
                        onChange={(
                          event
                        ) =>
                          onUpdateSet(
                            exercise.id,
                            set.id,
                            "reps",
                            Math.max(
                              0,
                              Math.floor(
                                Number(
                                  event
                                    .target
                                    .value
                                )
                              )
                            )
                          )
                        }
                        className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center font-medium disabled:bg-transparent disabled:text-slate-400"
                      />

                      <span className="text-sm text-slate-500">
                        reps
                      </span>
                    </div>
                  )}

                  {/* ----------------------------------------
                      Assistance
                  ----------------------------------------- */}

                  {isAssistance && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          inputMode="decimal"
                          min={0}
                          value={
                            set.weight
                          }
                          disabled={
                            set.completed
                          }
                          onChange={(
                            event
                          ) =>
                            onUpdateSet(
                              exercise.id,
                              set.id,
                              "weight",
                              Math.max(
                                0,
                                Number(
                                  event
                                    .target
                                    .value
                                )
                              )
                            )
                          }
                          className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center font-medium disabled:bg-transparent disabled:text-slate-400"
                        />

                        <span className="text-sm text-slate-500">
                          lb assist
                        </span>
                      </div>

                      <span className="text-slate-400">
                        ×
                      </span>

                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          step={1}
                          value={
                            set.reps
                          }
                          disabled={
                            set.completed
                          }
                          onChange={(
                            event
                          ) =>
                            onUpdateSet(
                              exercise.id,
                              set.id,
                              "reps",
                              Math.max(
                                0,
                                Math.floor(
                                  Number(
                                    event
                                      .target
                                      .value
                                  )
                                )
                              )
                            )
                          }
                          className="w-14 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center font-medium disabled:bg-transparent disabled:text-slate-400"
                        />

                        <span className="text-sm text-slate-500">
                          reps
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ----------------------------------------
                      Weight × Duration
                  ----------------------------------------- */}

                  {isWeightDuration && (
                    <div className="flex items-center gap-2">
                      {/* Weight */}

                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          inputMode="decimal"
                          min={0}
                          value={set.weight}
                          disabled={set.completed}
                          onChange={(event) =>
                            onUpdateSet(
                              exercise.id,
                              set.id,
                              "weight",
                              Math.max(
                                0,
                                Number(
                                  event.target.value
                                )
                              )
                            )
                          }
                          className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center font-medium disabled:bg-transparent disabled:text-slate-400"
                        />

                        <span className="text-sm text-slate-500">
                          lb
                        </span>
                      </div>

                      <span className="text-slate-400">
                        ×
                      </span>

                      {/* Duration */}

                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          step={1}
                          value={set.reps}
                          disabled={set.completed}
                          onChange={(event) =>
                            onUpdateSet(
                              exercise.id,
                              set.id,
                              "reps",
                              Math.max(
                                0,
                                Math.floor(
                                  Number(
                                    event.target.value
                                  )
                                )
                              )
                            )
                          }
                          className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center font-medium disabled:bg-transparent disabled:text-slate-400"
                        />

                        <span className="text-sm text-slate-500">
                          sec
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ----------------------------------------
                      Load / Traditional Weight × Reps
                  ----------------------------------------- */}

                  {usesTraditionalInputs && (
                    <div className="flex items-center gap-2">
                      {/* Weight */}

                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          inputMode="decimal"
                          min={0}
                          value={
                            set.weight
                          }
                          disabled={
                            set.completed
                          }
                          onChange={(
                            event
                          ) =>
                            onUpdateSet(
                              exercise.id,
                              set.id,
                              "weight",
                              Math.max(
                                0,
                                Number(
                                  event
                                    .target
                                    .value
                                )
                              )
                            )
                          }
                          className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center font-medium disabled:bg-transparent disabled:text-slate-400"
                        />

                        <span className="text-sm text-slate-500">
                          lb
                        </span>
                      </div>

                      <span className="text-slate-400">
                        ×
                      </span>

                      {/* Reps */}

                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          inputMode="numeric"
                          min={0}
                          step={1}
                          value={
                            set.reps
                          }
                          disabled={
                            set.completed
                          }
                          onChange={(
                            event
                          ) =>
                            onUpdateSet(
                              exercise.id,
                              set.id,
                              "reps",
                              Math.max(
                                0,
                                Math.floor(
                                  Number(
                                    event
                                      .target
                                      .value
                                  )
                                )
                              )
                            )
                          }
                          className="w-14 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center font-medium disabled:bg-transparent disabled:text-slate-400"
                        />

                        <span className="text-sm text-slate-500">
                          reps
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ==========================================
                      Previous Workout Performance
                  =========================================== */}

                  {previousSet && (
                    <div className="mt-1 text-xs text-slate-500">
                      {/* Weight × Duration */}

                      {isWeightDuration && (
                        <>
                          Last:{" "}
                          {previousSet.weight}{" "}
                          lb ×{" "}
                          {previousSet.reps}{" "}
                          sec
                        </>
                      )}
                      {/* Duration */}

                      {isDuration && (
                        <>
                          Last:{" "}
                          {
                            previousSet.reps
                          }{" "}
                          sec
                        </>
                      )}

                      {/* Rep-only */}

                      {isReps && (
                        <>
                          Last:{" "}
                          {
                            previousSet.reps
                          }{" "}
                          reps
                        </>
                      )}

                      {/* Assistance */}

                      {isAssistance && (
                        <>
                          Last:{" "}
                          {
                            previousSet.weight
                          }{" "}
                          lb assist ×{" "}
                          {
                            previousSet.reps
                          }{" "}
                          reps
                        </>
                      )}

                      {/* Load / legacy */}

                      {usesTraditionalInputs && (
                        <>
                          Last:{" "}
                          {
                            previousSet.weight
                          }{" "}
                          lb ×{" "}
                          {
                            previousSet.reps
                          }{" "}
                          reps
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* ------------------------------------------
                    Remove Set
                ------------------------------------------- */}

                {exercise.sets.length >
                  1 && (
                  <button
                    type="button"
                    onClick={() =>
                      onRemoveSet(
                        exercise.id,
                        set.id
                      )
                    }
                    aria-label={`Remove set ${index + 1}`}
                    className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2
                      size={16}
                    />
                  </button>
                )}
              </div>
            );
          }
        )}
      </div>

      {/* ----------------------------------------------------
          Add Set
      ----------------------------------------------------- */}

      <button
        type="button"
        onClick={() =>
          onAddSet(
            exercise.id
          )
        }
        className="mt-3 w-full rounded-xl border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-600 transition hover:border-blue-500 hover:text-blue-600"
      >
        + Add Set
      </button>
    </Card>
  );
}