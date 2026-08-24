import {
  getAdaptiveWeeklyScheduleRecommendation,
} from "@/features/workout/logic/getAdaptiveWeeklyScheduleRecommendation";

import {
  fitnessOsTrainingPlan,
} from "@/features/workout/trainingPlan";

import type {
  TrainingPlanState,
} from "@/features/workout/types";


export default function AdaptiveWeeklyRecommendationTestPage() {
  const state:
    TrainingPlanState = {
      trainingPlanId:
        fitnessOsTrainingPlan.id,

      startDate:
        "2026-01-05",

      heldWeekStartDates:
        [],

      evaluatedWeekStartDates:
        [],

      weeklyProgressionDecisions:
        [],

      successfulSteadyStateWeeks:
        3,

      deloadWeekStartDates:
        [],

      runningProgression: {
        Development: {
          role:
            "Development",

          label:
            "Development Intervals",

          intensity:
            "Intervals",

          durationMin:
            30,

          durationMax:
            30,

          runIntervalMinutes:
            4,

          walkIntervalMinutes:
            2,
        },

        Endurance: {
          role:
            "Endurance",

          label:
            "Long Run / Hike",

          intensity:
            "Easy",

          durationMin:
            55,

          durationMax:
            55,
        },
      },
    };


  const recommendation =
    getAdaptiveWeeklyScheduleRecommendation({
      state,

      weekStartDate:
        "2026-08-24",

      unavailableDates: [
        "2026-08-24",
      ],
    });


  const moveIds =
    recommendation?.moves.map(
      (move) =>
        move.trainingActivityId
    ) ??
    [];


  const passed =
    recommendation !==
      null &&

    recommendation.status ===
      "Acceptable" &&

    recommendation
      .evaluation
      .conflicts
      .length ===
      0 &&

    recommendation
      .evaluation
      .unavailableViolations
      .length ===
      0 &&

    recommendation
      .evaluation
      .hasHighConflict ===
      false &&

    moveIds.includes(
      "steady-monday-gym-a"
    ) &&

    moveIds.includes(
      "steady-wednesday-gym-b"
    ) &&

    moveIds.includes(
      "steady-friday-gym-c"
    ) &&

    moveIds.includes(
      "steady-monday-zone-2"
    ) &&

    recommendation
      .optionalAdjustments
      .length >
      0;


  return (
    <main
      style={{
        padding:
          32,

        fontFamily:
          "monospace",
      }}
    >
      <h1>
        Adaptive Weekly Recommendation Test
      </h1>

      <pre>
        {JSON.stringify(
          {
            recommendation,

            passed,
          },
          null,
          2
        )}
      </pre>
    </main>
  );
}
