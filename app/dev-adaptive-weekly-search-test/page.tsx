import {
  getWeeklyScheduleRearrangementOptions,
} from "@/features/workout/logic/getWeeklyScheduleRearrangementOptions";

import {
  rankWeeklyScheduleRearrangements,
} from "@/features/workout/logic/rankWeeklyScheduleRearrangements";

import {
  fitnessOsTrainingPlan,
} from "@/features/workout/trainingPlan";

import type {
  TrainingPlanState,
} from "@/features/workout/types";


export default function AdaptiveWeeklySearchTestPage() {
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


  const unavailableDates = [
    "2026-08-24",
  ];


  const options =
    getWeeklyScheduleRearrangementOptions({
      state,

      weekStartDate:
        "2026-08-24",

      unavailableDates,
    });


  const ranked =
    rankWeeklyScheduleRearrangements({
      state,

      weekStartDate:
        "2026-08-24",

      activities:
        options,

      unavailableDates,

      maxResults:
        20,
    });


  const best =
    ranked[0];


  const nonAvoid =
    ranked.filter(
      (candidate) =>
        candidate.status !==
        "Avoid"
    );


  const passed =
    options.length ===
      4 &&

    ranked.length >
      0 &&

    best !==
      undefined &&

    // The unavailable Monday must actually be cleared.
    best.unavailableViolations.length ===
      0 &&

    // Gym A must no longer be scheduled Monday.
    best.moves.some(
      (move) =>
        move.trainingActivityId ===
          "steady-monday-gym-a" &&
        move.scheduledDate !==
          "2026-08-24"
    ) &&

    // Zone 2 must also leave Monday.
    best.moves.some(
      (move) =>
        move.trainingActivityId ===
          "steady-monday-zone-2" &&
        move.scheduledDate !==
          "2026-08-24"
    );


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
        Adaptive Weekly Search Test
      </h1>

      <pre>
        {JSON.stringify(
          {
            options,
            best,
            nonAvoidCount:
              nonAvoid.length,
            nonAvoid:
              nonAvoid.slice(
                0,
                5
              ),
            ranked,
            passed,
          },
          null,
          2
        )}
      </pre>
    </main>
  );
}