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
  ChevronDown,
  MoreVertical,
  Plus,
  RefreshCw,
  Trash2,
  TrendingUp,
} from "lucide-react";

import { Card } from "@/components/ui";

import RpeLegend from "./RpeLegend";

import {
  RPE_SCALE,
} from "../rpe";

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
  ExerciseSubstitutionEnvironment,
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

  exerciseNumber: number;

  exerciseCount: number;

  unavailableExerciseDefinitionIds:
    string[];

  substitutionEnvironment:
    ExerciseSubstitutionEnvironment;

  availableEquipment:
    WorkoutEquipment[];

  availableCapabilities:
    WorkoutSetupCapability[];

  // Most recent historical performance for this exercise.
  // Undefined means the exercise has never been logged before.
  previousExercise?: Exercise;

  expanded: boolean;

  onToggleExpanded: () => void;

  onToggleSet: (
    exerciseId: string,
    setId: string
  ) => void;

  onUpdateSet: (
    exerciseId: string,
    setId: string,
    field: "weight" | "reps" | "rpe",
    value: number
  ) => void;

  onAddSet: (
    exerciseId: string
  ) => void;

  onRemoveSet: (
    exerciseId: string,
    setId: string
  ) => void;

  onAddRampUpSet: (exerciseId: string) => void;

  onUpdateRampUpSet: (
    exerciseId: string,
    setId: string,
    field: "weight" | "reps",
    value: number
  ) => void;

  onToggleRampUpSet: (exerciseId: string, setId: string) => void;

  onRemoveRampUpSet: (exerciseId: string, setId: string) => void;

  onRemoveExercise: (
    exerciseId: string
  ) => void;

  onReplaceExercise: (
    exerciseId: string,
    replacementExerciseDefinitionId: string
  ) => boolean;
}

// ============================================================
// Resistance Band Options
// ============================================================
//
// Current home setup uses a WHATAFIT tube-band set labelled
// 10 / 20 / 30 / 40 / 50 lb. ExerciseSet.weight stores the
// labelled band resistance while resistanceType === "Band"
// preserves the fact that this is not conventional fixed weight.
// ============================================================

const BAND_RESISTANCE_OPTIONS = [
  10,
  20,
  30,
  40,
  50,
] as const;


// ============================================================
// Exercise Card
// ============================================================

export default function ExerciseCard({
  exercise,
  exerciseNumber,
  exerciseCount,
  unavailableExerciseDefinitionIds,
  substitutionEnvironment,
  availableEquipment,
  availableCapabilities,
  previousExercise,
  expanded,
  onToggleExpanded,
  onToggleSet,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onAddRampUpSet,
  onUpdateRampUpSet,
  onToggleRampUpSet,
  onRemoveRampUpSet,
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

  const [
    substitutionFeedback,
    setSubstitutionFeedback,
  ] = useState<string | null>(
    null
  );

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
      return {
        environment:
          substitutionEnvironment,

        availableEquipment,

        availableCapabilities,

        unavailableExerciseIds:
          unavailableExerciseDefinitionIds,
      };
    }, [
      availableCapabilities,
      availableEquipment,
      substitutionEnvironment,
      unavailableExerciseDefinitionIds,
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

  function handleExerciseReplacement(
    replacementExerciseDefinitionId: string
  ) {
    const replaced =
      onReplaceExercise(
        exercise.id,
        replacementExerciseDefinitionId
      );

    if (!replaced) {
      setSubstitutionFeedback(
        "That exercise could not be used because it is already in this workout or is no longer available."
      );

      return;
    }

    setSubstitutionFeedback(
      null
    );

    setSubstitutionsOpen(
      false
    );
  }

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

  const isBand =
    exerciseDefinition?.resistanceType ===
    "Band";

  // Exercises without progression programming continue
  // using the traditional weight × reps interface.
  const usesTraditionalInputs =
    !progressionType ||
    (isLoad && !isWeightDuration);

  const supportsRampUpSets =
    exerciseDefinition?.resistanceType === "Weight" &&
    exerciseDefinition?.performanceType !== "Duration";

  // Repetition values for unilateral exercises are stored as the
  // number completed on each side. The numeric value itself stays
  // unchanged; this metadata only changes interpretation/display.
  const isPerSide =
    exerciseDefinition?.repCounting ===
    "PerSide";

  const repsUnitLabel =
    isPerSide
      ? "reps / side"
      : "reps";

  const completedSetCount =
    exercise.sets.filter(
      (
        set
      ) =>
        set.completed
    ).length;

  const exerciseComplete =
    exercise.sets.length >
      0 &&
    completedSetCount ===
      exercise.sets.length;

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
      : isPerSide &&
          target.repMin !== undefined &&
          target.repMax !== undefined
        ? target.action === "no-history"
          ? `${target.repMin}–${target.repMax} reps / side`
          : `${target.label} / side`
        : target.label;

  // ----------------------------------------------------------
  // Target Action Label
  // ----------------------------------------------------------

  function getTargetActionLabel() {
    switch (target.action) {
      case "increase-load":
        return "Increase load";

      case "reduce-load":
        return "Reduce load";

      case "build-reps":
        return "Build reps";

      case "reduce-assistance":
        return "Reduce assistance";

      case "increase-assistance":
        return "Increase assistance";

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
  // Numeric Input Helpers
  // ----------------------------------------------------------

  function getNumericInputValue(
    value: number
  ) {
    return value === 0
      ? ""
      : value;
  }

  function parseWeightInput(
    value: string
  ) {
    if (value === "") {
      return 0;
    }

    return Math.max(
      0,
      Number(value)
    );
  }

  function parseRepsInput(
    value: string
  ) {
    if (value === "") {
      return 0;
    }

    return Math.max(
      0,
      Math.floor(
        Number(value)
      )
    );
  }


  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  return (
    <Card
      className={
        exerciseComplete
          ? "rounded-2xl border border-green-300 bg-green-50 p-6 shadow-sm"
          : "rounded-2xl border bg-white p-6 shadow-sm"
      }
    >
      {/* ----------------------------------------------------
          Exercise Header
      ----------------------------------------------------- */}

      <div className="relative flex items-center justify-between">

        <button
          type="button"
          aria-expanded={
            expanded
          }
          onClick={
            onToggleExpanded
          }
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >

          <ChevronDown
            size={20}
            className={
              expanded
                ? "shrink-0 rotate-180 text-slate-500 transition-transform"
                : "shrink-0 text-slate-500 transition-transform"
            }
          />

          <span className="min-w-0">

            <span className="block truncate text-lg font-semibold text-slate-900">
              {exercise.name}
            </span>

            <span className="mt-0.5 block text-xs text-slate-500">
              Exercise {exerciseNumber} of {exerciseCount}
              {" · "}
              {completedSetCount}/{exercise.sets.length} sets
              {exerciseComplete
                ? " · Complete"
                : ""}
            </span>

          </span>

        </button>

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

      {expanded && (
        <>

      {/* ----------------------------------------------------
          Exercise Substitution
      ----------------------------------------------------- */}

      {substitutionOptions.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => {
              setSubstitutionFeedback(
                null
              );

              setSubstitutionsOpen(
                (open) => !open
              );
            }}
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
                      onClick={() =>
                        handleExerciseReplacement(
                          option.exercise.id
                        )
                      }
                      className="flex w-full items-center rounded-lg border border-slate-200 bg-white px-3 py-3 text-left transition hover:border-blue-300 hover:bg-blue-50"
                    >
                      <span>
                        <span className="block font-medium text-slate-900">
                          {
                            option.exercise
                              .name
                          }
                        </span>

                        {option.relationship === "Fallback" && (
                          <span className="mt-0.5 block text-xs text-slate-500">
                            Related fallback — different movement setup
                          </span>
                        )}
                      </span>
                    </button>
                  )
                )}
              </div>

              {substitutionFeedback && (
                <p
                  role="status"
                  className="mt-3 text-sm text-red-600"
                >
                  {substitutionFeedback}
                </p>
              )}
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
                      handleExerciseReplacement(
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

      {supportsRampUpSets && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Ramp-up sets</p>
              <p className="mt-1 text-xs text-slate-600">Optional light practice before working sets. Not counted in volume, completion, or PRs.</p>
            </div>
            {(exercise.rampUpSets?.length ?? 0) < 3 && (
              <button type="button" onClick={() => onAddRampUpSet(exercise.id)} className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-800">
                <Plus size={14} /> Add ramp-up set
              </button>
            )}
          </div>

          {(exercise.rampUpSets?.length ?? 0) > 0 && (
            <div className="mt-3 space-y-2">
              {exercise.rampUpSets?.map((set, index) => (
                <div key={set.id} className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${set.completed ? "border-emerald-300 bg-emerald-50" : "border-amber-200 bg-white"}`}>
                  <button type="button" onClick={() => onToggleRampUpSet(exercise.id, set.id)} aria-label={`${set.completed ? "Uncomplete" : "Complete"} ramp-up set ${index + 1}`} className={`flex h-7 w-7 items-center justify-center rounded-full ${set.completed ? "bg-emerald-500 text-white" : "border-2 border-amber-500 bg-amber-50"}`}>
                    {set.completed && <Check size={16} />}
                  </button>
                  <span className="text-sm font-medium text-slate-700">Warm-up {index + 1}</span>
                  <div className="ml-auto flex items-center gap-2">
                    <input type="number" inputMode="decimal" min={0} value={getNumericInputValue(set.weight)} disabled={set.completed} onChange={(event) => onUpdateRampUpSet(exercise.id, set.id, "weight", parseWeightInput(event.target.value))} className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center text-base disabled:bg-transparent" />
                    <span className="text-sm text-slate-500">lb ×</span>
                    <input type="number" inputMode="numeric" min={0} step={1} value={getNumericInputValue(set.reps)} disabled={set.completed} onChange={(event) => onUpdateRampUpSet(exercise.id, set.id, "reps", parseRepsInput(event.target.value))} className="w-14 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center text-base disabled:bg-transparent" />
                    <span className="text-sm text-slate-500">{repsUnitLabel}</span>
                    <button type="button" onClick={() => onRemoveRampUpSet(exercise.id, set.id)} aria-label={`Remove ramp-up set ${index + 1}`} className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------
          Exercise Sets
      ----------------------------------------------------- */}

      <div className="mt-4">

        <div className="mb-2 flex items-center justify-between gap-3">

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Working Sets
          </p>

          <RpeLegend
            context="StrengthSet"
          />

        </div>

        <div className="space-y-2">
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
                            getNumericInputValue(
                              set.reps
                            )
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
                              parseRepsInput(
                                event.target.value
                              )
                            )
                        }
                        className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center text-base font-medium disabled:bg-transparent disabled:text-slate-400"
                      />

                      <span className="text-sm text-slate-500">
                        sec
                      </span>
                    </div>
                  )}

                  {/* ----------------------------------------
                      Resistance Band × Reps
                  ----------------------------------------- */}

                  {isBand && isReps && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <select
                          value={
                            getNumericInputValue(
                              set.weight
                            )
                          }
                          disabled={
                            set.completed
                          }
                          aria-label={`Band resistance for set ${index + 1}`}
                          onChange={(
                            event
                          ) =>
                            onUpdateSet(
                              exercise.id,
                              set.id,
                              "weight",
                              parseWeightInput(
                                event.target.value
                              )
                            )
                          }
                          className="w-24 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center text-base font-medium disabled:bg-transparent disabled:text-slate-400"
                        >
                          <option value="">
                            Band
                          </option>

                          {BAND_RESISTANCE_OPTIONS.map(
                            (resistance) => (
                              <option
                                key={
                                  resistance
                                }
                                value={
                                  resistance
                                }
                              >
                                {resistance}
                              </option>
                            )
                          )}
                        </select>

                        <span className="text-sm text-slate-500">
                          lb band
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
                            getNumericInputValue(
                              set.reps
                            )
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
                              parseRepsInput(
                                event.target.value
                              )
                            )
                          }
                          className="w-14 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center text-base font-medium disabled:bg-transparent disabled:text-slate-400"
                        />

                        <span className="text-sm text-slate-500">
                          {repsUnitLabel}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ----------------------------------------
                      Rep-Only / Bodyweight
                  ----------------------------------------- */}

                  {isReps && !isBand && (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        step={1}
                        value={
                            getNumericInputValue(
                              set.reps
                            )
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
                              parseRepsInput(
                                event.target.value
                              )
                            )
                        }
                        className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center text-base font-medium disabled:bg-transparent disabled:text-slate-400"
                      />

                      <span className="text-sm text-slate-500">
                        {repsUnitLabel}
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
                            getNumericInputValue(
                              set.weight
                            )
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
                              parseWeightInput(
                                event.target.value
                              )
                            )
                          }
                          className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center text-base font-medium disabled:bg-transparent disabled:text-slate-400"
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
                            getNumericInputValue(
                              set.reps
                            )
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
                              parseRepsInput(
                                event.target.value
                              )
                            )
                          }
                          className="w-14 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center text-base font-medium disabled:bg-transparent disabled:text-slate-400"
                        />

                        <span className="text-sm text-slate-500">
                          {repsUnitLabel}
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
                          value={
                            getNumericInputValue(
                              set.weight
                            )
                          }
                          disabled={set.completed}
                          onChange={(event) =>
                            onUpdateSet(
                              exercise.id,
                              set.id,
                              "weight",
                              parseWeightInput(
                                event.target.value
                              )
                            )
                          }
                          className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center text-base font-medium disabled:bg-transparent disabled:text-slate-400"
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
                          value={
                            getNumericInputValue(
                              set.reps
                            )
                          }
                          disabled={set.completed}
                          onChange={(event) =>
                            onUpdateSet(
                              exercise.id,
                              set.id,
                              "reps",
                              parseRepsInput(
                                event.target.value
                              )
                            )
                          }
                          className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center text-base font-medium disabled:bg-transparent disabled:text-slate-400"
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
                            getNumericInputValue(
                              set.weight
                            )
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
                              parseWeightInput(
                                event.target.value
                              )
                            )
                          }
                          className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center text-base font-medium disabled:bg-transparent disabled:text-slate-400"
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
                            getNumericInputValue(
                              set.reps
                            )
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
                              parseRepsInput(
                                event.target.value
                              )
                            )
                          }
                          className="w-14 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-center text-base font-medium disabled:bg-transparent disabled:text-slate-400"
                        />

                        <span className="text-sm text-slate-500">
                          {repsUnitLabel}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ----------------------------------------
                      Optional Set RPE
                  ----------------------------------------- */}

                  <label className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    <span>RPE</span>

                    <select
                      value={set.rpe ?? ""}
                      aria-label={`RPE for set ${index + 1}`}
                      onChange={(event) =>
                        onUpdateSet(
                          exercise.id,
                          set.id,
                          "rpe",
                          Number(event.target.value)
                        )
                      }
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-base sm:text-xs"
                    >
                      <option value="">Optional</option>
                      {RPE_SCALE.map(
                        (
                          entry
                        ) => (
                          <option
                            key={
                              entry.value
                            }
                            value={
                              entry.value
                            }
                          >
                            {
                              entry.value
                            }
                          </option>
                        )
                      )}
                    </select>
                  </label>

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

                      {/* Band + Reps */}

                      {isBand && isReps && (
                        <>
                          Last:{" "}
                          {
                            previousSet.weight
                          }{" "}
                          lb band ×{" "}
                          {
                            previousSet.reps
                          }{" "}
                          {repsUnitLabel}
                        </>
                      )}

                      {/* Rep-only */}

                      {isReps && !isBand && (
                        <>
                          Last:{" "}
                          {
                            previousSet.reps
                          }{" "}
                          {repsUnitLabel}
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
                          {repsUnitLabel}
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
                          {repsUnitLabel}
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

        </>
      )}

    </Card>
  );
}
