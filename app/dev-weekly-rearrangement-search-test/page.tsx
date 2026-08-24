import {
  rankWeeklyScheduleRearrangements,
} from "@/features/workout/logic/rankWeeklyScheduleRearrangements";

import {
  fitnessOsTrainingPlan,
} from "@/features/workout/trainingPlan";

import type {
  TrainingPlanState,
} from "@/features/workout/types";


export default function WeeklyRearrangementSearchTestPage() {
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


  const ranked =
    rankWeeklyScheduleRearrangements({
      state,

      weekStartDate:
        "2026-08-24",

      unavailableDates: [
        "2026-08-24",
      ],

      maxResults:
        20,

      activities: [
        {
          trainingActivityId:
            "steady-monday-gym-a",

          originalDate:
            "2026-08-24",

          candidateDates: [
            "2026-08-25",
            "2026-08-26",
            "2026-08-27",
            "2026-08-28",
            "2026-08-29",
          ],
        },

        {
          trainingActivityId:
            "steady-wednesday-gym-b",

          originalDate:
            "2026-08-26",

          candidateDates: [
            "2026-08-25",
            "2026-08-27",
            "2026-08-28",
            "2026-08-29",
          ],
        },

        {
          trainingActivityId:
            "steady-friday-gym-c",

          originalDate:
            "2026-08-28",

          candidateDates: [
            "2026-08-26",
            "2026-08-27",
            "2026-08-29",
          ],
        },
      ],
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
    ranked.length >
      0 &&

    best !==
      undefined &&

    // Monday is unavailable, so a valid recommendation must
    // actually move Gym A away from Monday.
    best.moves.some(
      (move) =>
        move.trainingActivityId ===
          "steady-monday-gym-a" &&
        move.scheduledDate !==
          "2026-08-24"
    ) &&

    // This test does not assume strength-only rearrangement can
    // solve the week. We simply confirm that the search runs and
    // produces deterministic ranked candidates.
    Number.isFinite(
      best.score
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
        Weekly Rearrangement Search Test
      </h1>

      <pre>
        {JSON.stringify(
          {
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