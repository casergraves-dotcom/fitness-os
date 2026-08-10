"use client";

// ============================================================
// Imports
// ============================================================

import {
  useEffect,
  useState,
} from "react";

import type {
  TrainingActivity,
  TrainingActivityCompletion,
} from "../types";

import {
  formatTrainingDate,
  readTrainingActivityCompletions,
  recordTrainingActivityCompletion,
  writeTrainingActivityCompletions,
} from "../utils/trainingActivityCompletionStorage";


// ============================================================
// Training Activity Completions Hook
// ============================================================

export function useTrainingActivityCompletions() {

  // ----------------------------------------------------------
  // State
  // ----------------------------------------------------------

  const [
    completions,
    setCompletions,
  ] = useState<
    TrainingActivityCompletion[]
  >([]);

  const [
    loaded,
    setLoaded,
  ] = useState(false);


  // ----------------------------------------------------------
  // Load
  // ----------------------------------------------------------

  useEffect(() => {
    const savedCompletions =
      readTrainingActivityCompletions();

    setCompletions(
      savedCompletions
    );

    setLoaded(true);
  }, []);


  // ----------------------------------------------------------
  // Save
  // ----------------------------------------------------------

  function saveCompletions(
    next:
      TrainingActivityCompletion[]
  ) {
    setCompletions(
      next
    );

    writeTrainingActivityCompletions(
      next
    );
  }


  // ----------------------------------------------------------
  // Complete Activity
  // ----------------------------------------------------------

  function completeActivity(
    activity: TrainingActivity,
    options?: {
      date?: Date;
      workoutSessionId?: string;
      completedAt?: Date;
    }
  ) {
    const completion =
      recordTrainingActivityCompletion(
        activity,
        options
      );

    // The storage utility has already written the authoritative
    // completion list. Reload it so React state stays synchronized
    // with the exact data that was persisted.
    setCompletions(
      readTrainingActivityCompletions()
    );

    return completion;
  }


  // ----------------------------------------------------------
  // Remove Completion
  // ----------------------------------------------------------

  function removeCompletion(
    completionId: string
  ) {
    const updated =
      completions.filter(
        (completion) =>
          completion.id !==
          completionId
      );

    saveCompletions(
      updated
    );
  }


  // ----------------------------------------------------------
  // Remove Activity Completion
  // ----------------------------------------------------------

  function removeActivityCompletion(
    trainingActivityId: string,
    date: string
  ) {
    const updated =
      completions.filter(
        (completion) =>
          !(
            completion.trainingActivityId ===
              trainingActivityId &&
            completion.date ===
              date
          )
      );

    saveCompletions(
      updated
    );
  }


  // ----------------------------------------------------------
  // Check Activity Completion
  // ----------------------------------------------------------

  function isActivityCompleted(
    trainingActivityId: string,
    date: string
  ) {
    return completions.some(
      (completion) =>
        completion.trainingActivityId ===
          trainingActivityId &&
        completion.date ===
          date
    );
  }


  // ----------------------------------------------------------
  // Get Activity Completion
  // ----------------------------------------------------------

  function getActivityCompletion(
    trainingActivityId: string,
    date: string
  ) {
    return completions.find(
      (completion) =>
        completion.trainingActivityId ===
          trainingActivityId &&
        completion.date ===
          date
    );
  }


  // ----------------------------------------------------------
  // Clear Completion History
  // ----------------------------------------------------------

  function clearCompletions() {
    saveCompletions(
      []
    );
  }


  // ----------------------------------------------------------
  // Refresh
  // ----------------------------------------------------------
  //
  // Some completion records can be written outside this hook,
  // such as when a strength workout is finished.
  //
  // This gives screens a way to synchronize React state with
  // the authoritative completion storage when necessary.

  function refreshCompletions() {
    setCompletions(
      readTrainingActivityCompletions()
    );
  }


  // ----------------------------------------------------------
  // Public API
  // ----------------------------------------------------------

  return {
    completions,
    loaded,

    completeActivity,

    removeCompletion,
    removeActivityCompletion,

    isActivityCompleted,
    getActivityCompletion,

    clearCompletions,
    refreshCompletions,

    formatTrainingDate,
  };
}