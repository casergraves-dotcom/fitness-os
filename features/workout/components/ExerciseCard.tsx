"use client";

// ============================================================
// Imports
// ============================================================

import {
  useMemo,
  useState,
} from "react";

import {
  BookOpen,
  Check,
  ChevronDown,
  MoreVertical,
  Plus,
  RefreshCw,
  Trash2,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";

import { Card } from "@/components/ui";

import RpeLegend from "./RpeLegend";
import WeightConverter from "./WeightConverter";

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
import { getReviewedGuidanceImages } from "../guidanceMedia";

import type {
  ExerciseSubstitutionEnvironment,
} from "../exerciseSubstitutions";

import type {
  WorkoutEquipment,
  WorkoutSetupCapability,
  StrengthMovementRole,
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

  // Most recent complete normal-volume performance. Reduced sessions can use
  // this as supporting progression evidence without treating omitted sets as
  // failures.
  recentFullExercise?: Exercise;

  expanded: boolean;

  focusedLogging?: boolean;

  onToggleExpanded: () => void;

  onToggleSet: (
    exerciseId: string,
    setId: string
  ) => void;

  onFocusedExerciseComplete?: () => void;

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

const RAMP_UP_MOVEMENT_ROLES = new Set<StrengthMovementRole>([
  "Squat",
  "SquatGlute",
  "HipHinge",
  "HipExtension",
  "HorizontalPush",
  "HorizontalPull",
  "VerticalPush",
  "VerticalPull",
]);


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
  recentFullExercise,
  expanded,
  focusedLogging = false,
  onToggleExpanded,
  onToggleSet,
  onFocusedExerciseComplete,
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
    guidanceOpen,
    setGuidanceOpen,
  ] = useState(false);

  const [
    editingCompletedSetIds,
    setEditingCompletedSetIds,
  ] = useState<string[]>([]);

  const [focusedSetId, setFocusedSetId] = useState<string | null>(null);

  const [rampUpOpen, setRampUpOpen] = useState(false);

  const [targetDetailsOpen, setTargetDetailsOpen] = useState(false);

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
    exerciseDefinition?.performanceType !== "Duration" &&
    exerciseDefinition.movementRoles?.some((role) =>
      RAMP_UP_MOVEMENT_ROLES.has(role)
    ) === true;

  const rampUpSets = exercise.rampUpSets ?? [];
  const completedRampUpSetCount = rampUpSets.filter((set) => set.completed).length;
  const rampUpSummary = rampUpSets.length > 0
    ? `${completedRampUpSetCount}/${rampUpSets.length} complete · ${rampUpSets
        .map((set) => `${set.weight} lb × ${set.reps}`)
        .join(" · ")}`
    : "Optional · none added";

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

  const completedSetSummary = exercise.sets
    .filter((set) => set.completed)
    .map((set) => {
      if (isWeightDuration) return `${set.weight} lb × ${set.reps} sec`;
      if (isDuration) return `${set.reps} sec`;
      if (isBand && isReps) return `${set.weight} lb band × ${set.reps}`;
      if (isAssistance) return `${set.weight} lb assist × ${set.reps}`;
      if (isReps && !isBand) return `${set.reps} ${repsUnitLabel}`;
      return `${set.weight} lb × ${set.reps}`;
    })
    .join(" · ");

  const focusedSet = focusedLogging
    ? exercise.sets.find((set) => set.id === focusedSetId) ??
      exercise.sets.find((set) => !set.completed) ??
      exercise.sets.at(-1)
    : undefined;
  const focusedSetIndex = focusedSet
    ? exercise.sets.findIndex((set) => set.id === focusedSet.id)
    : -1;
  const canCompleteFocusedSet =
    focusedSetIndex >= 0 &&
    exercise.sets
      .slice(0, focusedSetIndex)
      .every((set) => set.completed);

  // ----------------------------------------------------------
  // Today's Target
  // ----------------------------------------------------------

  const target =
    useMemo(
      () =>
        getExerciseTarget(
          exerciseDefinition,
          previousExercise,
          { recentFullExercise }
        ),
      [
        exerciseDefinition,
        previousExercise,
        recentFullExercise,
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

      case "confirm-full-session":
        return "Hold for full session";

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
          ? `rounded-2xl border border-green-300 bg-green-50 shadow-sm ${expanded ? "p-4 sm:p-6" : "p-3"}`
          : `rounded-2xl border bg-white shadow-sm ${expanded ? "p-4 sm:p-6" : "p-3"}`
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
          className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >

          <ChevronDown
            size={18}
            className={
              expanded
                ? "shrink-0 rotate-180 text-slate-500 transition-transform"
                : "shrink-0 text-slate-500 transition-transform"
            }
          />

          <span className="min-w-0">

            <span className={`block truncate font-semibold text-slate-900 ${expanded ? "text-lg" : "text-base"}`}>
              {exercise.name}
            </span>

            <span className="mt-0.5 block truncate text-xs text-slate-500">
              Exercise {exerciseNumber} of {exerciseCount}
              {" · "}
              {completedSetCount}/{exercise.sets.length} sets
              {exerciseComplete
                ? " · Complete"
                : ""}
              {!expanded && completedSetSummary
                ? ` · ${completedSetSummary}`
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
            {focusedLogging && substitutionOptions.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSubstitutionFeedback(null);
                  setSubstitutionsOpen(true);
                  setGuidanceOpen(false);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw size={16} /> Alternatives
              </button>
            )}

            {focusedLogging && exerciseDefinition?.guidance && (
              <button
                type="button"
                onClick={() => {
                  setGuidanceOpen(true);
                  setSubstitutionsOpen(false);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                <BookOpen size={16} /> How to
              </button>
            )}

            {focusedLogging && supportsRampUpSets && (
              <button
                type="button"
                onClick={() => {
                  setRampUpOpen(true);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                <TrendingUp size={16} /> Ramp-up sets
              </button>
            )}

            {focusedLogging && (
              <button
                type="button"
                onClick={() => {
                  onAddSet(exercise.id);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                <Plus size={16} /> Add working set
              </button>
            )}

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

      {(substitutionOptions.length > 0 || exerciseDefinition?.guidance) && (
        <div className={focusedLogging ? "" : "mt-2 flex flex-wrap gap-2"}>
      {substitutionOptions.length > 0 && (
        <div className="contents">
          <button
            type="button"
            onClick={() => {
              setSubstitutionFeedback(
                null
              );

              setSubstitutionsOpen(
                (open) => !open
              );
              setGuidanceOpen(false);
            }}
            className={`${focusedLogging ? "hidden" : "inline-flex"} min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50`}
          >
            <RefreshCw size={15} />
            Alternatives
          </button>

          {substitutionsOpen && (
            <div className="mt-1 basis-full rounded-xl border border-slate-200 bg-slate-50 p-3">
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

      {exerciseDefinition?.guidance && (
        <div className="contents">
          <button
            type="button"
            aria-expanded={guidanceOpen}
            onClick={() => {
              setGuidanceOpen((open) => !open);
              setSubstitutionsOpen(false);
            }}
            className={`${focusedLogging ? "hidden" : "inline-flex"} min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50`}
          >
            <BookOpen size={15} />
            How to
          </button>

          {guidanceOpen && (
            <div className="mt-1 grid basis-full gap-4 rounded-xl border border-blue-100 bg-blue-50 p-4 md:grid-cols-2">
              {getReviewedGuidanceImages(exerciseDefinition.guidance.demoMedia).map((media) => (
                <figure key={media.source} className="md:col-span-2">
                  <Image
                    src={media.source}
                    alt={media.description}
                    width={media.width}
                    height={media.height}
                    className="mx-auto h-auto max-h-80 w-auto max-w-full rounded-lg border border-blue-100 bg-white object-contain"
                  />
                  <figcaption className="mt-2 text-xs text-slate-600">
                    Example equipment; your gym&apos;s model may differ.
                    {media.attribution && (
                      <span className="mt-1 block">
                        Photo: <a href={media.attribution.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">{media.attribution.creator}</a>
                        {" · "}<a href={media.attribution.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline">{media.attribution.license}</a>
                        {" · "}{media.attribution.changes}
                      </span>
                    )}
                  </figcaption>
                </figure>
              ))}
              {isPerSide && (
                <div className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-blue-800 md:col-span-2">
                  <span className="font-semibold">Per-side exercise:</span>{" "}
                  complete the prescribed repetitions on each side.
                </div>
              )}

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                  Setup
                </p>
                <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
                  {exerciseDefinition.guidance.setup.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                  Execution
                </p>
                <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
                  {exerciseDefinition.guidance.execution.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>

              {exerciseDefinition.requiredEquipment &&
                exerciseDefinition.requiredEquipment.length > 0 && (
                  <div className="md:col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                      Equipment
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      {exerciseDefinition.requiredEquipment
                        .map((item) => item.replace(/([a-z])([A-Z])/g, "$1 $2"))
                        .join(" · ")}
                    </p>
                  </div>
                )}

              {exerciseDefinition.guidance.techniqueCues && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Technique cues</p>
                  <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
                    {exerciseDefinition.guidance.techniqueCues.map((cue) => <li key={cue}>{cue}</li>)}
                  </ul>
                </div>
              )}

              {exerciseDefinition.guidance.commonMistakes && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Common mistakes</p>
                  <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
                    {exerciseDefinition.guidance.commonMistakes.map((mistake) => <li key={mistake}>{mistake}</li>)}
                  </ul>
                </div>
              )}

              {(exerciseDefinition.guidance.regressionExerciseIds ||
                exerciseDefinition.guidance.progressionExerciseIds) && (
                <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
                  {exerciseDefinition.guidance.regressionExerciseIds && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                        Easier options
                      </p>
                      <p className="mt-2 text-sm text-slate-700">
                        {exerciseDefinition.guidance.regressionExerciseIds
                          .map(
                            (exerciseId) =>
                              exerciseLibrary.find((item) => item.id === exerciseId)?.name,
                          )
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  )}

                  {exerciseDefinition.guidance.progressionExerciseIds && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                        Progressions
                      </p>
                      <p className="mt-2 text-sm text-slate-700">
                        {exerciseDefinition.guidance.progressionExerciseIds
                          .map(
                            (exerciseId) =>
                              exerciseLibrary.find((item) => item.id === exerciseId)?.name,
                          )
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {exerciseDefinition.guidance.safetyConsiderations && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">Safety</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-amber-950">
                    {exerciseDefinition.guidance.safetyConsiderations.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              )}

            </div>
          )}
        </div>
      )}
        </div>
      )}

      {/* ----------------------------------------------------
          Today's Target
      ----------------------------------------------------- */}

      {showTarget && (
        <div className={`${focusedLogging ? "mt-2 p-2" : "mt-3 p-3"} rounded-xl border border-blue-100 bg-blue-50`}>
          <div className="flex items-center gap-2">
            <div className={`flex shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 ${focusedLogging ? "h-7 w-7" : "h-8 w-8"}`}>
              <TrendingUp size={16} />
            </div>

            <div className="min-w-0 flex-1">
              {!focusedLogging && (
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Today&apos;s Target
                </p>
              )}

              <p className={`${focusedLogging ? "" : "mt-0.5"} flex flex-wrap gap-x-1 text-sm leading-5 text-slate-900`}>
                <span className="font-bold">{targetDisplayLabel}</span>
                <span className="text-blue-700">· {getTargetActionLabel()}</span>
              </p>
            </div>

            <button
              type="button"
              aria-expanded={targetDetailsOpen}
              onClick={() => setTargetDetailsOpen((open) => !open)}
              className="min-h-10 shrink-0 rounded-lg px-2 text-xs font-semibold text-blue-700"
            >
              {targetDetailsOpen ? "Hide" : "Details"}
            </button>
          </div>

          {targetDetailsOpen && (
            <div className="mt-2 border-t border-blue-100 pt-2 pl-11">
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
          )}
        </div>
      )}

      {supportsRampUpSets && (!focusedLogging || rampUpOpen) && (
        <div className={`${focusedLogging ? "mt-2" : "mt-4"} overflow-hidden rounded-xl border border-amber-200 bg-amber-50`}>
          <button
            type="button"
            aria-expanded={rampUpOpen}
            onClick={() => setRampUpOpen((open) => !open)}
            className="flex min-h-12 w-full items-center gap-3 px-3 py-2 text-left"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold uppercase tracking-wider text-amber-700">Ramp-up sets</span>
              <span className="block truncate text-xs text-slate-600">{rampUpSummary}</span>
            </span>
            <ChevronDown size={18} className={`shrink-0 text-amber-700 transition-transform ${rampUpOpen ? "rotate-180" : ""}`} />
          </button>

          {rampUpOpen && (
            <div className="border-t border-amber-200 px-3 pb-3 pt-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs leading-5 text-slate-600">Optional practice; excluded from volume, completion, and PRs.</p>
                {rampUpSets.length < 3 && (
                  <button
                    type="button"
                    onClick={() => onAddRampUpSet(exercise.id)}
                    className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-semibold text-amber-800"
                  >
                    <Plus size={14} /> Add
                  </button>
                )}
              </div>

              {rampUpSets.length > 0 && (
                <div className="mt-2 space-y-2">
                  {rampUpSets.map((set, index) =>
                    set.completed ? (
                      <button
                        key={set.id}
                        type="button"
                        onClick={() => onToggleRampUpSet(exercise.id, set.id)}
                        className="flex min-h-11 w-full items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-left"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white"><Check size={16} /></span>
                        <span className="text-sm font-semibold text-slate-700">Warm-up {index + 1}</span>
                        <span className="ml-auto text-sm text-slate-600">{set.weight} lb × {set.reps}</span>
                        <span className="text-xs font-semibold text-blue-700">Edit</span>
                      </button>
                    ) : (
                      <div key={set.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-white p-2">
                        <button type="button" onClick={() => onToggleRampUpSet(exercise.id, set.id)} aria-label={`Complete ramp-up set ${index + 1}`} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-amber-500 bg-amber-50" />
                        <span className="text-sm font-medium text-slate-700">Warm-up {index + 1}</span>
                        <div className="ml-auto flex items-center gap-1.5">
                          <input type="number" inputMode="decimal" min={0} value={getNumericInputValue(set.weight)} onChange={(event) => onUpdateRampUpSet(exercise.id, set.id, "weight", parseWeightInput(event.target.value))} className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-2 text-center text-base" />
                          <span className="text-sm text-slate-500">lb ×</span>
                          <input type="number" inputMode="numeric" min={0} step={1} value={getNumericInputValue(set.reps)} onChange={(event) => onUpdateRampUpSet(exercise.id, set.id, "reps", parseRepsInput(event.target.value))} className="w-14 rounded-lg border border-slate-300 bg-white px-2 py-2 text-center text-base" />
                          <button type="button" onClick={() => onRemoveRampUpSet(exercise.id, set.id)} aria-label={`Remove ramp-up set ${index + 1}`} className="flex h-9 w-9 items-center justify-center text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ----------------------------------------------------
          Exercise Sets
      ----------------------------------------------------- */}

      <div className={focusedLogging ? "mt-3" : "mt-4"}>

        {!focusedLogging && <div className="mb-2 flex items-center justify-between gap-3">

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Working Sets
          </p>

          <RpeLegend
            context="StrengthSet"
          />

        </div>}

        <div className="space-y-2">
        {focusedLogging && (
          <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1" aria-label="Working set selection">
            {exercise.sets.map((set, index) => (
              <button
                key={set.id}
                type="button"
                onClick={() => {
                  setFocusedSetId(set.id);
                  setEditingCompletedSetIds((current) =>
                    set.completed && !current.includes(set.id)
                      ? [...current, set.id]
                      : current
                  );
                }}
                aria-current={focusedSet?.id === set.id ? "step" : undefined}
                className={`flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold ${
                  focusedSet?.id === set.id
                    ? "border-blue-500 bg-blue-50 text-blue-800"
                    : set.completed
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {set.completed && <Check size={15} />}
                Set {index + 1}
              </button>
            ))}
            <div className="ml-auto shrink-0">
              <RpeLegend context="StrengthSet" />
            </div>
          </div>
        )}
        {exercise.sets
          .filter((set) => !focusedLogging || set.id === focusedSet?.id)
          .map(
          (set) => {
            const index = exercise.sets.findIndex((candidate) => candidate.id === set.id);
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

            const editingCompletedSet =
              set.completed &&
              editingCompletedSetIds.includes(set.id);

            if (set.completed && !editingCompletedSet) {
              const completedPerformance = isWeightDuration
                ? `${set.weight} lb × ${set.reps} sec`
                : isDuration
                  ? `${set.reps} sec`
                  : isBand && isReps
                    ? `${set.weight} lb band × ${set.reps} ${repsUnitLabel}`
                    : isAssistance
                      ? `${set.weight} lb assist × ${set.reps} ${repsUnitLabel}`
                      : isReps && !isBand
                        ? `${set.reps} ${repsUnitLabel}`
                        : `${set.weight} lb × ${set.reps} ${repsUnitLabel}`;

              return (
                <button
                  key={set.id}
                  type="button"
                  onClick={() =>
                    setEditingCompletedSetIds((current) =>
                      current.includes(set.id) ? current : [...current, set.id]
                    )
                  }
                  aria-label={`Edit completed set ${index + 1}`}
                  className="flex min-h-11 w-full items-center gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-left transition hover:border-emerald-400 hover:bg-emerald-100"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check size={16} />
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-slate-700">Set {index + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
                    {completedPerformance}
                    {set.rpe ? ` · RPE ${set.rpe}` : ""}
                  </span>
                  <span className="text-xs font-semibold text-blue-700">Edit</span>
                </button>
              );
            }

            return (
              <div
                key={set.id}
                className={`grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-3 rounded-xl border p-3 transition-all sm:flex sm:p-4 ${
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
                  onClick={() => {
                    const completesExercise =
                      !set.completed &&
                      exercise.sets.every(
                        (candidate) => candidate.completed || candidate.id === set.id
                      );

                    if (set.completed) {
                      setEditingCompletedSetIds((current) =>
                        current.filter((setId) => setId !== set.id)
                      );
                    }

                    onToggleSet(
                      exercise.id,
                      set.id
                    );

                    if (!set.completed && focusedLogging) {
                      setFocusedSetId(null);

                      if (completesExercise) {
                        onFocusedExerciseComplete?.();
                      }
                    }
                  }}
                  aria-label={
                    set.completed
                      ? `Uncomplete set ${index + 1}`
                      : `Complete set ${index + 1}`
                  }
                  className={`col-start-1 row-start-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition sm:col-auto sm:row-auto ${
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
                  className={`col-start-2 row-start-1 sm:col-auto sm:row-auto sm:ml-3 ${
                    set.completed
                      ? "text-slate-400"
                      : ""
                  }`}
                >
                  Set {index + 1}{editingCompletedSet ? " · editing" : ""}
                </span>

                {/* ==========================================
                    Set Input
                =========================================== */}

                <div className="col-span-3 row-start-2 mt-3 flex w-full flex-col items-end sm:col-auto sm:row-auto sm:ml-auto sm:mt-0 sm:w-auto">
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

                  <div className="mt-2 flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                  {(usesTraditionalInputs || isAssistance || isWeightDuration) && (
                    <div>
                      <WeightConverter
                        initialPounds={set.weight}
                        onApplyPounds={(pounds) =>
                          onUpdateSet(exercise.id, set.id, "weight", pounds)
                        }
                      />
                    </div>
                  )}

                  {/* ----------------------------------------
                      Optional Set RPE
                  ----------------------------------------- */}

                  <label className="flex min-h-9 items-center gap-2 text-xs text-slate-500">
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
                      className="min-h-9 rounded-lg border border-slate-300 bg-white px-2 py-1 text-base sm:text-xs"
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
                    <div className="text-xs text-slate-500">
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

                  {editingCompletedSet && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditingCompletedSetIds((current) =>
                          current.filter((setId) => setId !== set.id)
                        )
                      }
                      className="min-h-9 text-xs font-semibold text-blue-700"
                    >
                      Done editing
                    </button>
                  )}
                  </div>
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
                    className="col-start-3 row-start-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 sm:col-auto sm:row-auto sm:ml-2"
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

        {focusedLogging && focusedSet && !focusedSet.completed && (
          <button
            type="button"
            disabled={!canCompleteFocusedSet}
            onClick={() => {
              const completesExercise = exercise.sets.every(
                (set) => set.completed || set.id === focusedSet.id
              );

              onToggleSet(exercise.id, focusedSet.id);
              setFocusedSetId(null);

              if (completesExercise) {
                onFocusedExerciseComplete?.();
              }
            }}
            className="mt-3 min-h-12 w-full rounded-xl bg-blue-600 px-4 py-3 text-base font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Complete Set {focusedSetIndex + 1}
          </button>
        )}
        </div>

      </div>

      {/* ----------------------------------------------------
          Add Set
      ----------------------------------------------------- */}

      {!focusedLogging && <button
        type="button"
        onClick={() =>
          onAddSet(
            exercise.id
          )
        }
        className="mt-3 w-full rounded-xl border border-dashed border-slate-300 py-3 text-sm font-medium text-slate-600 transition hover:border-blue-500 hover:text-blue-600"
      >
        + Add Set
      </button>}

        </>
      )}

    </Card>
  );
}
