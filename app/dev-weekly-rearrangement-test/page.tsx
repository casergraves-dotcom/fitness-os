import {
  evaluateWeeklyScheduleRearrangement,
} from "@/features/workout/logic/evaluateWeeklyScheduleRearrangement";

import {
  fitnessOsTrainingPlan,
} from "@/features/workout/trainingPlan";

import type {
  TrainingPlanState,
} from "@/features/workout/types";


export default function WeeklyRearrangementTestPage() {
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


  // ----------------------------------------------------------
  // Strategy A
  // ----------------------------------------------------------
  //
  // Move only Monday Gym A to Saturday.
  //
  // We already know this creates consecutive strength with
  // Friday Gym C, so the whole-week evaluator should reject it.

  const singleMove =
    evaluateWeeklyScheduleRearrangement({
      state,

      weekStartDate:
        "2026-08-24",

      unavailableDates: [
        "2026-08-24",
      ],

      moves: [
        {
          trainingActivityId:
            "steady-monday-gym-a",

          originalDate:
            "2026-08-24",

          scheduledDate:
            "2026-08-29",
        },
      ],
    });


  // ----------------------------------------------------------
  // Strategy B
  // ----------------------------------------------------------
  //
  // Shift the three strength sessions:
  //
  // Mon Gym A -> Tue
  // Wed Gym B -> Thu
  // Fri Gym C -> Sat
  //
  // We are NOT assuming this is good. Aerial and running load
  // may still make this arrangement undesirable.

  const coordinatedShift =
    evaluateWeeklyScheduleRearrangement({
      state,

      weekStartDate:
        "2026-08-24",

      unavailableDates: [
        "2026-08-24",
      ],

      moves: [
        {
          trainingActivityId:
            "steady-monday-gym-a",

          originalDate:
            "2026-08-24",

          scheduledDate:
            "2026-08-25",
        },
        {
          trainingActivityId:
            "steady-wednesday-gym-b",

          originalDate:
            "2026-08-26",

          scheduledDate:
            "2026-08-27",
        },
        {
          trainingActivityId:
            "steady-friday-gym-c",

          originalDate:
            "2026-08-28",

          scheduledDate:
            "2026-08-29",
        },
      ],
    });


  const passed =
    singleMove !==
      null &&

    coordinatedShift !==
      null &&

    singleMove.status ===
      "Avoid" &&

    singleMove.hasHighConflict ===
      true &&

    // The coordinated strategy must at least be evaluated as a
    // distinct whole-week option. We intentionally do not assert
    // that it is safe yet.
    coordinatedShift.moves.length ===
      3;


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
        Weekly Rearrangement Test
      </h1>

      <pre>
        {JSON.stringify(
          {
            singleMove,
            coordinatedShift,
            coordinatedShiftImprovesScore:
              singleMove !== null &&
              coordinatedShift !== null
                ? coordinatedShift.score <
                  singleMove.score
                : null,
            passed,
          },
          null,
          2
        )}
      </pre>
    </main>
  );
}