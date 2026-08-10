"use client";

// ============================================================
// Imports
// ============================================================

import {
  useMemo,
  useState,
} from "react";

import {
  Pencil,
  Search,
  Trash2,
  X,
} from "lucide-react";

import AppShell from "@/components/layout/AppShell";

import {
  useExerciseLibrary,
} from "@/features/workout/hooks/useExerciseLibrary";

import type {
  ExerciseCategory,
  ExerciseDefinition,
} from "@/features/workout/types";

// ============================================================
// Types
// ============================================================

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
// Exercise Library Screen
// ============================================================

export default function ExerciseLibraryPage() {
  // ----------------------------------------------------------
  // Exercise Library
  // ----------------------------------------------------------

  const {
    exercises,
    loaded,
    deleteCustomExercise,
    updateCustomExercise,
  } = useExerciseLibrary();

  // ----------------------------------------------------------
  // Search / Filter State
  // ----------------------------------------------------------

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState<CategoryFilter>("All");

  // ----------------------------------------------------------
  // Edit Exercise State
  // ----------------------------------------------------------

  const [
    editingExercise,
    setEditingExercise,
  ] = useState<ExerciseDefinition | null>(
    null
  );

  const [
    editName,
    setEditName,
  ] = useState("");

  const [
    editCategory,
    setEditCategory,
  ] = useState<ExerciseCategory>("Chest");

  const [
    editError,
    setEditError,
  ] = useState("");

  // ----------------------------------------------------------
  // Filtered Exercises
  // ----------------------------------------------------------

  const filteredExercises =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return exercises.filter(
        (exercise) => {
          // Filter by category.
          if (
            selectedCategory !== "All" &&
            exercise.category !==
              selectedCategory
          ) {
            return false;
          }

          // Filter by exercise name.
          if (
            normalizedSearch &&
            !exercise.name
              .toLowerCase()
              .includes(
                normalizedSearch
              )
          ) {
            return false;
          }

          return true;
        }
      );
    }, [
      exercises,
      search,
      selectedCategory,
    ]);

  // ----------------------------------------------------------
  // Open Edit Form
  // ----------------------------------------------------------

  function openEditExercise(
    exercise: ExerciseDefinition
  ) {
    // Only custom exercises should ever call this,
    // but keep the guard here for extra protection.
    if (!exercise.custom) {
      return;
    }

    setEditingExercise(
      exercise
    );

    setEditName(
      exercise.name
    );

    setEditCategory(
      exercise.category
    );

    setEditError("");
  }

  // ----------------------------------------------------------
  // Close Edit Form
  // ----------------------------------------------------------

  function closeEditExercise() {
    setEditingExercise(null);
    setEditName("");
    setEditCategory("Chest");
    setEditError("");
  }

  // ----------------------------------------------------------
  // Save Edited Exercise
  // ----------------------------------------------------------

  function saveEditedExercise() {
    if (!editingExercise) {
      return;
    }

    const updated =
      updateCustomExercise(
        editingExercise.id,
        editName,
        editCategory
      );

    if (!updated) {
      setEditError(
        "Exercise names must be unique and cannot be blank."
      );

      return;
    }

    closeEditExercise();
  }

  // ----------------------------------------------------------
  // Loading State
  // ----------------------------------------------------------

  if (!loaded) {
    return (
      <AppShell>
        <div className="p-4 text-sm text-slate-500">
          Loading exercises...
        </div>
      </AppShell>
    );
  }

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  return (
    <AppShell>
      <div className="space-y-5">
        {/* ------------------------------------------------
            Page Header
        ------------------------------------------------- */}

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Settings
          </p>

          <h1 className="mt-1 text-2xl font-bold">
            Exercise Library
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Browse and manage your built-in and custom exercises.
          </p>
        </div>

        {/* ------------------------------------------------
            Search
        ------------------------------------------------- */}

        <div className="relative">
          <Search
            size={18}
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
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* ------------------------------------------------
            Category Filters
        ------------------------------------------------- */}

        <div className="flex gap-2 overflow-x-auto pb-1">
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

        {/* ------------------------------------------------
            Exercise Count
        ------------------------------------------------- */}

        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {filteredExercises.length}{" "}
            {filteredExercises.length === 1
              ? "exercise"
              : "exercises"}
          </p>
        </div>

        {/* ------------------------------------------------
            Exercise List
        ------------------------------------------------- */}

        <div className="space-y-2">
          {filteredExercises.map(
            (exercise) => (
              <div
                key={exercise.id}
                className="flex items-center rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
              >
                {/* ----------------------------------------
                    Exercise Information
                ----------------------------------------- */}

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">
                    {exercise.name}
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm text-slate-500">
                      {exercise.category}
                    </span>

                    <span className="text-slate-300">
                      •
                    </span>

                    <span
                      className={`text-xs font-semibold ${
                        exercise.custom
                          ? "text-blue-600"
                          : "text-slate-400"
                      }`}
                    >
                      {exercise.custom
                        ? "Custom"
                        : "Built-in"}
                    </span>
                  </div>
                </div>

                {/* ----------------------------------------
                    Custom Exercise Controls
                ----------------------------------------- */}

                {exercise.custom && (
                  <div className="ml-3 flex shrink-0 items-center gap-1">
                    {/* Edit */}

                    <button
                      type="button"
                      onClick={() =>
                        openEditExercise(
                          exercise
                        )
                      }
                      aria-label={`Edit ${exercise.name}`}
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Pencil size={18} />
                    </button>

                    {/* Delete */}

                    <button
                      type="button"
                      onClick={() => {
                        const confirmed =
                          window.confirm(
                            `Delete ${exercise.name} from your exercise library?`
                          );

                        if (confirmed) {
                          deleteCustomExercise(
                            exercise.id
                          );
                        }
                      }}
                      aria-label={`Delete ${exercise.name}`}
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            )
          )}

          {/* ----------------------------------------------
              No Results
          ----------------------------------------------- */}

          {filteredExercises.length ===
            0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white py-10 text-center">
              <p className="font-medium text-slate-600">
                No exercises found
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Try another search or category.
              </p>
            </div>
          )}
        </div>

        {/* ------------------------------------------------
            Edit Custom Exercise
        ------------------------------------------------- */}

        {editingExercise && (
          <div className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm">
            {/* Edit Header */}

            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                  Custom Exercise
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Edit Exercise
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  closeEditExercise
                }
                aria-label="Close exercise editor"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* --------------------------------------------
                Exercise Name
            --------------------------------------------- */}

            <div className="mt-5">
              <label
                htmlFor="edit-exercise-name"
                className="text-sm font-semibold text-slate-700"
              >
                Exercise Name
              </label>

              <input
                id="edit-exercise-name"
                type="text"
                value={editName}
                onChange={(event) => {
                  setEditName(
                    event.target.value
                  );

                  setEditError("");
                }}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* --------------------------------------------
                Exercise Category
            --------------------------------------------- */}

            <div className="mt-4">
              <label
                htmlFor="edit-exercise-category"
                className="text-sm font-semibold text-slate-700"
              >
                Category
              </label>

              <select
                id="edit-exercise-category"
                value={editCategory}
                onChange={(event) => {
                  setEditCategory(
                    event.target
                      .value as ExerciseCategory
                  );

                  setEditError("");
                }}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {exerciseCategories.map(
                  (category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* --------------------------------------------
                Validation Error
            --------------------------------------------- */}

            {editError && (
              <p className="mt-3 text-sm font-medium text-red-600">
                {editError}
              </p>
            )}

            {/* --------------------------------------------
                Edit Controls
            --------------------------------------------- */}

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={
                  closeEditExercise
                }
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  saveEditedExercise
                }
                className="flex-1 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}