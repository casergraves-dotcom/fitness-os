"use client";

// ============================================================
// Imports
// ============================================================

import {
  useMemo,
  useState,
} from "react";

import {
  Plus,
  Search,
  X,
} from "lucide-react";

import {
  useExerciseLibrary,
} from "../hooks/useExerciseLibrary";

import type {
  ExerciseCategory,
} from "../types";

// ============================================================
// Types
// ============================================================

interface AddExerciseProps {
  // Names of exercises already in the workout.
  // These will be hidden from the picker.
  existingExerciseNames?: string[];

  // Return both the ID and name so the parent screen
  // can decide how it wants to use the exercise.
  onAddExercise: (
    exerciseId: string,
    exerciseName: string
  ) => void;
}

type CategoryFilter =
  | "All"
  | ExerciseCategory;

// ============================================================
// Constants
// ============================================================

const categories: CategoryFilter[] = [
  "All",
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Core",
];

const exerciseCategories: ExerciseCategory[] = [
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Core",
];

// ============================================================
// Add Exercise
// ============================================================

export default function AddExercise({
  existingExerciseNames = [],
  onAddExercise,
}: AddExerciseProps) {
  // ----------------------------------------------------------
  // Exercise Library
  // ----------------------------------------------------------

  // This library contains both built-in exercises and
  // exercises created by the user.
  const {
    exercises,
    loaded,
    addCustomExercise,
  } = useExerciseLibrary();

  // ----------------------------------------------------------
  // Picker State
  // ----------------------------------------------------------

  const [
    pickerOpen,
    setPickerOpen,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState<CategoryFilter>("All");

  // ----------------------------------------------------------
  // Create Exercise State
  // ----------------------------------------------------------

  const [
    creatingExercise,
    setCreatingExercise,
  ] = useState(false);

  const [
    newExerciseName,
    setNewExerciseName,
  ] = useState("");

  const [
    newExerciseCategory,
    setNewExerciseCategory,
  ] = useState<ExerciseCategory>(
    "Chest"
  );

  // ----------------------------------------------------------
  // Available Exercises
  // ----------------------------------------------------------

  const availableExercises =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      return exercises.filter(
        (exercise) => {
          // Don't show exercises already included
          // in the current workout.
          const alreadyAdded =
            existingExerciseNames.some(
              (name) =>
                name.toLowerCase() ===
                exercise.name.toLowerCase()
            );

          if (alreadyAdded) {
            return false;
          }

          // Apply category filter.
          if (
            selectedCategory !== "All" &&
            exercise.category !==
              selectedCategory
          ) {
            return false;
          }

          // Apply search text.
          if (
            normalizedSearch &&
            !exercise.name
              .toLowerCase()
              .includes(normalizedSearch)
          ) {
            return false;
          }

          return true;
        }
      );
    }, [
      exercises,
      existingExerciseNames,
      search,
      selectedCategory,
    ]);

  // ----------------------------------------------------------
  // Close Picker
  // ----------------------------------------------------------

  function closePicker() {
    setPickerOpen(false);
    setSearch("");
    setSelectedCategory("All");

    setCreatingExercise(false);
    setNewExerciseName("");
    setNewExerciseCategory("Chest");
  }

  // ----------------------------------------------------------
  // Open Create Exercise Form
  // ----------------------------------------------------------

  function openCreateExercise() {
    // Carry the user's current search into the
    // exercise-name field to save typing.
    setNewExerciseName(
      search.trim()
    );

    // If the user already filtered by a category,
    // start the new exercise in that category.
    if (
      selectedCategory !== "All"
    ) {
      setNewExerciseCategory(
        selectedCategory
      );
    }

    setCreatingExercise(true);
  }

  // ----------------------------------------------------------
  // Create Custom Exercise
  // ----------------------------------------------------------

  function handleCreateExercise() {
    const newExercise =
      addCustomExercise(
        newExerciseName,
        newExerciseCategory
      );

    // addCustomExercise returns null for an empty
    // or duplicate exercise name.
    if (!newExercise) {
      return;
    }

    // Immediately add the newly created exercise
    // to whichever workout opened this picker.
    onAddExercise(
      newExercise.id,
      newExercise.name
    );

    closePicker();
  }

  // ----------------------------------------------------------
  // Closed State
  // ----------------------------------------------------------

  if (!pickerOpen) {
    return (
      <button
        type="button"
        onClick={() =>
          setPickerOpen(true)
        }
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 font-semibold text-slate-600 transition hover:border-blue-500 hover:text-blue-600"
      >
        <Plus size={18} />

        Add Exercise
      </button>
    );
  }

  // ----------------------------------------------------------
  // Loading State
  // ----------------------------------------------------------

  if (!loaded) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
        Loading exercises...
      </div>
    );
  }

  // ----------------------------------------------------------
  // Create Exercise Screen
  // ----------------------------------------------------------

  if (creatingExercise) {
    return (
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        {/* ------------------------------------------------
            Header
        ------------------------------------------------- */}

        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">
              Create Exercise
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Add a custom exercise to your library.
            </p>
          </div>

          <button
            type="button"
            onClick={closePicker}
            aria-label="Close exercise picker"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* ------------------------------------------------
            Exercise Name
        ------------------------------------------------- */}

        <div className="mt-5">
          <label
            htmlFor="new-exercise-name"
            className="text-sm font-semibold text-slate-700"
          >
            Exercise Name
          </label>

          <input
            id="new-exercise-name"
            type="text"
            value={newExerciseName}
            onChange={(event) =>
              setNewExerciseName(
                event.target.value
              )
            }
            placeholder="Cable Lateral Raise"
            autoFocus
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* ------------------------------------------------
            Category
        ------------------------------------------------- */}

        <div className="mt-4">
          <p className="text-sm font-semibold text-slate-700">
            Category
          </p>

          <div className="mt-2 flex flex-wrap gap-2">
            {exerciseCategories.map(
              (category) => {
                const selected =
                  newExerciseCategory ===
                  category;

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() =>
                      setNewExerciseCategory(
                        category
                      )
                    }
                    className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                      selected
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {category}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* ------------------------------------------------
            Actions
        ------------------------------------------------- */}

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() =>
              setCreatingExercise(false)
            }
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Back
          </button>

          <button
            type="button"
            disabled={
              !newExerciseName.trim()
            }
            onClick={
              handleCreateExercise
            }
            className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Create & Add
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------
  // Exercise Picker
  // ----------------------------------------------------------

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      {/* --------------------------------------------------
          Header
      --------------------------------------------------- */}

      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">
            Add Exercise
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Choose an exercise to add.
          </p>
        </div>

        <button
          type="button"
          onClick={closePicker}
          aria-label="Close exercise picker"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
        >
          <X size={18} />
        </button>
      </div>

      {/* --------------------------------------------------
          Search
      --------------------------------------------------- */}

      <div className="relative mt-4">
        <Search
          size={17}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Search exercises..."
          className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* --------------------------------------------------
          Category Filters
      --------------------------------------------------- */}

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {categories.map(
          (category) => {
            const selected =
              selectedCategory ===
              category;

            return (
              <button
                key={category}
                type="button"
                onClick={() =>
                  setSelectedCategory(
                    category
                  )
                }
                className={`shrink-0 rounded-full px-3 py-2 text-sm font-medium transition ${
                  selected
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {category}
              </button>
            );
          }
        )}
      </div>

      {/* --------------------------------------------------
          Exercise Results
      --------------------------------------------------- */}

      <div className="mt-4 max-h-80 space-y-2 overflow-y-auto">
        {availableExercises.map(
          (exercise) => (
            <button
              key={exercise.id}
              type="button"
              onClick={() => {
                onAddExercise(
                  exercise.id,
                  exercise.name
                );

                closePicker();
              }}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:border-blue-500 hover:bg-blue-50"
            >
              <div>
                <p className="font-medium">
                  {exercise.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {exercise.category}

                  {exercise.custom
                    ? " • Custom"
                    : ""}
                </p>
              </div>

              <Plus
                size={18}
                className="text-slate-400"
              />
            </button>
          )
        )}

        {/* No matching exercises */}

        {availableExercises.length ===
          0 && (
          <div className="py-6 text-center">
            <p className="font-medium text-slate-600">
              No exercises found
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Try another search or create your own.
            </p>
          </div>
        )}
      </div>

      {/* --------------------------------------------------
          Create Custom Exercise
      --------------------------------------------------- */}

      <button
        type="button"
        onClick={openCreateExercise}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-blue-300 px-4 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
      >
        <Plus size={17} />

        Create New Exercise
      </button>
    </div>
  );
}