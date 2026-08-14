"use client";

// ============================================================
// Imports
// ============================================================

import AppShell from "@/components/layout/AppShell";

import {
  CoachCard,
  getCoachRecommendation,
} from "@/features/coach";

import {
  MissionCard,
  WeeklyProgress,
} from "@/features/today";

import {
  useTrainingPlanState,
} from "@/features/workout/hooks/useTrainingPlanState";

import {
  fitnessOsTrainingPlan,
} from "@/features/workout/trainingPlan";

import {
  getTrainingScheduleForDate,
} from "@/features/workout/utils/getTrainingScheduleForDate";

import {
  useTrainingActivityCompletions,
} from "@/features/workout/hooks/useTrainingActivityCompletions";

import {
  useWeeklyTrainingProgression,
} from "@/features/workout/hooks/useWeeklyTrainingProgression";

import {
  useWorkoutHistory,
} from "@/features/workout/hooks/useWorkoutHistory";

import {
  useRunSession,
} from "@/features/running/hooks/useRunSession";

import TodaysTrainingCard from "../components/TodaysTrainingCard";

import {
  getCurrentWeeklyProgress,
} from "../utils/getCurrentWeeklyProgress";

import {
  MorningCheckIn,
  useMorningCheckIn,
} from "@/features/recovery";

// ============================================================
// Today Screen
// ============================================================

export default function TodayScreen() {
  // ----------------------------------------------------------
  // Morning Check-In
  // ----------------------------------------------------------

  const {
    ratings,
    history:
      morningCheckInHistory,
    loaded:
      morningCheckInLoaded,
    setRatings,
  } = useMorningCheckIn();

  // ----------------------------------------------------------
  // Training Plan State
  // ----------------------------------------------------------

  const {
    state:
      trainingPlanState,

    loaded:
      trainingPlanStateLoaded,

    startTrainingPlan,

    clearTrainingPlan,

    applyWeeklyProgressionDecision,
  } = useTrainingPlanState();

  const {
    completions:
      trainingActivityCompletions,

    loaded:
      trainingActivityCompletionsLoaded,

    completeActivity,

    removeActivityCompletion,

    isActivityCompleted,
  } = useTrainingActivityCompletions();

  const {
    history:
      workoutHistory,

    loaded:
      workoutHistoryLoaded,
  } = useWorkoutHistory();

  const {
    history:
      runHistory,

    loaded:
      runHistoryLoaded,
  } = useRunSession();

  useWeeklyTrainingProgression({
    state:
      trainingPlanState,

    loaded:
      trainingPlanStateLoaded,

    completions:
      trainingActivityCompletions,

    completionsLoaded:
      trainingActivityCompletionsLoaded,

    recoveryCheckIns:
      morningCheckInHistory,

    recoveryLoaded:
      morningCheckInLoaded,

    workoutHistory,

    workoutHistoryLoaded,

    runHistory,

    runHistoryLoaded,

    applyWeeklyProgressionDecision,
  });

  // ----------------------------------------------------------
  // Today's Training Schedule
  // ----------------------------------------------------------

  const schedule =
    trainingPlanState
      ? getTrainingScheduleForDate(
          fitnessOsTrainingPlan,
          trainingPlanState,
          new Date()
        )
      : null;

  // ----------------------------------------------------------
  // Current Weekly Progress
  // ----------------------------------------------------------

  const weeklyProgress =
    getCurrentWeeklyProgress(
      trainingPlanState,
      trainingActivityCompletions,
      new Date(),
      morningCheckInHistory,
      workoutHistory
    );

  // ----------------------------------------------------------
  // Coach
  // ----------------------------------------------------------

  const recommendation =
    getCoachRecommendation(
      ratings,
      schedule?.trainingDay.activities ??
        []
    );

  // ----------------------------------------------------------
  // Start Plan
  // ----------------------------------------------------------

  function handleStartPlan() {
    const now =
      new Date();

    // Find Monday of the current local week.
    const day =
      now.getDay();

    const daysSinceMonday =
      day === 0
        ? 6
        : day - 1;

    const monday =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() -
          daysSinceMonday
      );

    const year =
      monday.getFullYear();

    const month =
      String(
        monday.getMonth() + 1
      ).padStart(2, "0");

    const date =
      String(
        monday.getDate()
      ).padStart(2, "0");

    const startDate =
      `${year}-${month}-${date}`;

    startTrainingPlan(
      fitnessOsTrainingPlan.id,
      startDate
    );
  }

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  return (
    <AppShell>
      <div className="space-y-6">

        {/* ====================================================
            Coach
        ==================================================== */}

        <CoachCard
          recommendation={
            recommendation
          }
        />

        {/* ====================================================
            Today's Training
        ==================================================== */}

        <TodaysTrainingCard
          schedule={
            schedule
          }

          trainingPlanState={
            trainingPlanState
          }

          loaded={
            trainingPlanStateLoaded &&
            trainingActivityCompletionsLoaded &&
            morningCheckInLoaded &&
            workoutHistoryLoaded &&
            runHistoryLoaded
          }

          isActivityCompleted={
            isActivityCompleted
          }

          onCompleteActivity={
            (activity) => {
              if (!schedule) {
                return;
              }

              completeActivity(
                activity,
                {
                  date:
                    new Date(
                      `${schedule.date}T12:00:00`
                    ),
                }
              );
            }
          }

          onRemoveActivityCompletion={
            (activityId) => {
              if (!schedule) {
                return;
              }

              removeActivityCompletion(
                activityId,
                schedule.date
              );
            }
          }

          onStartPlan={
            handleStartPlan
          }

          onResetPlan={
            clearTrainingPlan
          }
        />

        {/* ====================================================
            Mission
        ==================================================== */}

        <MissionCard
          trainingActivities={
            schedule?.trainingDay.activities ??
            []
          }

          trainingDate={
            schedule?.date
          }

          isActivityCompleted={
            isActivityCompleted
          }
        />

        {/* ====================================================
            Morning Check-In
        ==================================================== */}

        <MorningCheckIn
          ratings={
            ratings
          }
          onChange={
            setRatings
          }
        />

        {/* ====================================================
            Weekly Progress
        ==================================================== */}

        <WeeklyProgress
          progress={
            weeklyProgress
          }

          loaded={
            trainingPlanStateLoaded &&
            trainingActivityCompletionsLoaded &&
            morningCheckInLoaded &&
            workoutHistoryLoaded &&
            runHistoryLoaded
          }
        />

      </div>
    </AppShell>
  );
}
