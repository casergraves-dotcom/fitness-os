"use client";

import { useState } from "react";

// ============================================================
// Imports
// ============================================================

import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  CoachCard,
  getCoachRecommendation,
} from "@/features/coach";
import {
  getWeeklyDecisionPattern,
} from "@/features/coach/getWeeklyDecisionPattern";
import {
  getLifestyleContextObservation,
} from "@/features/coach/getLifestyleContextObservation";
import { useCoachingPreferences } from "@/features/coach/hooks/useCoachingPreferences";
import {
  useLifestyleGoalProgressEvidence,
} from "@/features/progress/hooks/useLifestyleGoalProgressEvidence";
import { useBodyMeasurements } from "@/features/progress";

import {
  getWeeklyProgressStatus,
  TodayTargets,
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
  isCompletableTrainingActivity,
} from "@/features/workout/utils/isCompletableTrainingActivity";

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

import WeeklyDecisionRecord from "../components/WeeklyDecisionRecord";

import WeeklySchedule from "../components/WeeklySchedule";
import ConfirmYesterdayCard from "../components/ConfirmYesterdayCard";

import {
  DailyNutritionCard,
  useWeeklyNutritionAdherence,
} from "@/features/nutrition";

import {
  DailyStepsCard,
  useWeeklyStepAdherence,
} from "@/features/dailyActivity";


// ============================================================
// Today Screen
// ============================================================

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function TodayScreen() {
  const { preferences: coachingPreferences } = useCoachingPreferences();
  const [showManualCheckIn, setShowManualCheckIn] = useState(false);
  const [showWeeklySchedule, setShowWeeklySchedule] = useState(false);
  const [showWeeklyProgress, setShowWeeklyProgress] = useState(false);
  const {
    evidence: lifestyleEvidence,
  } = useLifestyleGoalProgressEvidence();
  const {
    loaded: bodyMeasurementsLoaded,
    measurements: bodyMeasurements,
    upsertMeasurementForDate,
  } = useBodyMeasurements();
  const todayDate = formatLocalDate(new Date());
  const todayMeasurement = bodyMeasurements.find(
    (measurement) =>
      measurement.date === todayDate &&
      measurement.source !== "DEXA"
  );
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

    overrideProgressionDecision,

    rescheduleTrainingActivity,

    rescheduleTrainingActivities,

    applyAdaptiveScheduleRecommendation,
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

  const {
    loaded:
      weeklyNutritionLoaded,

    weeklyAdherence:
      weeklyNutritionAdherence,
  } =
    useWeeklyNutritionAdherence();

  const {
    loaded:
      weeklyStepLoaded,

    weeklyAdherence:
      weeklyStepAdherence,
  } =
    useWeeklyStepAdherence();


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
      workoutHistory,
      runHistory
    );

  const weeklyProgressLoaded =
    trainingPlanStateLoaded &&
    trainingActivityCompletionsLoaded &&
    morningCheckInLoaded &&
    workoutHistoryLoaded &&
    runHistoryLoaded;

  const weeklyProgressStatus =
    weeklyProgress
      ? getWeeklyProgressStatus(weeklyProgress)
      : null;


  // ----------------------------------------------------------
  // Latest Weekly Progression Decision
  // ----------------------------------------------------------

  const latestProgressionDecision =
    trainingPlanState
      ?.weeklyProgressionDecisions
      ?.slice()
      .sort(
        (
          a,
          b
        ) =>
          b.weekStartDate.localeCompare(
            a.weekStartDate
          )
      )[0] ??
    null;

  const weeklyDecisionPattern =
    getWeeklyDecisionPattern(
      trainingPlanState?.weeklyProgressionDecisions ?? []
    );

  const lifestyleContext =
    getLifestyleContextObservation(
      lifestyleEvidence
    );


  // ----------------------------------------------------------
  // Coach
  // ----------------------------------------------------------

  const scheduledCoachActivities =
    schedule?.trainingDay.activities ??
    [];

  const actionableCoachActivities =
    scheduledCoachActivities.filter(
      isCompletableTrainingActivity
    );

  const shouldShowMorningCheckIn =
    showManualCheckIn ||
    coachingPreferences.checkInPrompt === "Daily" ||
    (coachingPreferences.checkInPrompt === "TrainingDays" &&
      actionableCoachActivities.length > 0);

  const completedCoachActivities =
    trainingActivityCompletionsLoaded &&
    schedule
      ? actionableCoachActivities.filter(
          (
            activity
          ) =>
            isActivityCompleted(
              activity.id,
              schedule.date
            )
        )
      : [];

  const unfinishedCoachActivities =
    trainingActivityCompletionsLoaded &&
    schedule
      ? scheduledCoachActivities.filter(
          (
            activity
          ) =>
            !isCompletableTrainingActivity(
              activity
            ) ||
            !isActivityCompleted(
              activity.id,
              schedule.date
            )
        )
      : scheduledCoachActivities;

  const recommendation =
    getCoachRecommendation(
      ratings,
      unfinishedCoachActivities,
      latestProgressionDecision
        ? {
            weekStartDate:
              latestProgressionDecision.weekStartDate,

            automaticReason:
              latestProgressionDecision.automaticReason,

            finalShouldAdvance:
              latestProgressionDecision.finalShouldAdvance,

            manuallyOverridden:
              latestProgressionDecision.manuallyOverridden,

            overrideReason:
              latestProgressionDecision.overrideReason,
          }
        : undefined,
      trainingActivityCompletionsLoaded
        ? {
            scheduledActionableCount:
              actionableCoachActivities.length,

            completedActionableCount:
              completedCoachActivities.length,
          }
        : undefined,
      weeklyDecisionPattern
        ? {
            label: weeklyDecisionPattern.label,
            message: weeklyDecisionPattern.message,
          }
        : undefined,
      lifestyleContext ?? undefined,
      coachingPreferences
    );


  // ----------------------------------------------------------
  // Start Plan
  // ----------------------------------------------------------

  function handleStartPlan() {
    const now =
      new Date();

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
      ).padStart(
        2,
        "0"
      );

    const date =
      String(
        monday.getDate()
      ).padStart(
        2,
        "0"
      );

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

        {shouldShowMorningCheckIn ? (
          <MorningCheckIn
            ratings={ratings}
            onChange={setRatings}
            loaded={morningCheckInLoaded}
            compactWhenComplete
            weightLb={todayMeasurement?.weightLb}
            weightLoaded={bodyMeasurementsLoaded}
            onSaveWeight={(weightLb) => {
              upsertMeasurementForDate({
                date: todayDate,
                weightLb,
              });
            }}
          />
        ) : (
          <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900">Morning Check-In</h2>
                <p className="mt-1 text-sm text-slate-500">Open it whenever you want readiness guidance.</p>
              </div>
              <Button type="button" variant="outline" onClick={() => setShowManualCheckIn(true)}>
                Open check-in
              </Button>
            </div>
          </Card>
        )}

        <CoachCard
          recommendation={
            recommendation
          }
          showAction={false}
        />

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
            (
              activity
            ) => {
              if (
                !schedule
              ) {
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
            (
              activityId
            ) => {
              if (
                !schedule
              ) {
                return;
              }

              removeActivityCompletion(
                activityId,
                schedule.date
              );
            }
          }

          onRescheduleActivity={
            (
              activity,
              scheduledDate
            ) => {
              if (
                !schedule
              ) {
                return;
              }

              rescheduleTrainingActivity(
                activity.id,
                schedule.date,
                scheduledDate
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

        <ConfirmYesterdayCard />


        <TodayTargets />


        <DailyNutritionCard />

        <DailyStepsCard />


        {showWeeklySchedule ? (
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => setShowWeeklySchedule(false)}
                variant="link"
                size="sm"
              >
                Hide full week
              </Button>
            </div>

            <WeeklySchedule
          state={
            trainingPlanState
          }

          completions={
            trainingActivityCompletions
          }

          loaded={
            trainingPlanStateLoaded &&
            trainingActivityCompletionsLoaded
          }

          currentDate={
            new Date()
          }

          onRescheduleActivity={
            (
              trainingActivityId,
              originalDate,
              scheduledDate
            ) => {
              rescheduleTrainingActivity(
                trainingActivityId,
                originalDate,
                scheduledDate
              );
            }
          }

          onRescheduleActivities={
            (
              moves
            ) => {
              rescheduleTrainingActivities(
                moves
              );
            }
          }

          onApplyAdaptiveScheduleRecommendation={
            (
              moves,
              adjustments,
              variantOverrides
            ) => {
              applyAdaptiveScheduleRecommendation(
                moves,
                adjustments,
                variantOverrides
              );
            }
          }
            />
          </div>
        ) : (
          <Card className="flex-row flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Training Week
              </p>
              <h2 className="mt-1 font-bold text-slate-900">
                Full schedule and adjustments
              </h2>
            </div>
            <Button
              type="button"
              onClick={() => setShowWeeklySchedule(true)}
              variant="outline"
            >
              View week
            </Button>
          </Card>
        )}


        {showWeeklyProgress ? (
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => setShowWeeklyProgress(false)}
                variant="link"
                size="sm"
              >
                Hide weekly progress
              </Button>
            </div>

            <WeeklyProgress
          progress={
            weeklyProgress
          }

          loaded={
            weeklyProgressLoaded
          }

          nutrition={
            weeklyNutritionAdherence
          }

          nutritionLoaded={
            weeklyNutritionLoaded
          }

          activity={
            weeklyStepAdherence
          }

          activityLoaded={
            weeklyStepLoaded
          }
            />
          </div>
        ) : (
          <Card className="flex-row flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                This Week
              </p>
              <h2 className="mt-1 font-bold text-slate-900">
                {!weeklyProgressLoaded
                  ? "Loading weekly progress..."
                  : weeklyProgressStatus?.title ?? "Weekly progress begins with your plan"}
              </h2>
              {weeklyProgressStatus && (
                <p className="mt-1 text-sm text-slate-500">
                  {weeklyProgressStatus.detail}
                </p>
              )}
            </div>
            <Button
              type="button"
              disabled={!weeklyProgressLoaded}
              onClick={() => setShowWeeklyProgress(true)}
              variant="outline"
            >
              View progress
            </Button>
          </Card>
        )}


        <WeeklyDecisionRecord
          decision={
            latestProgressionDecision
          }

          onOverride={
            overrideProgressionDecision
          }
        />

      </div>
    </AppShell>
  );
}
