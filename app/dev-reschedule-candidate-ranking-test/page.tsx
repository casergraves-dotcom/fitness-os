import {
  rankActivityRescheduleCandidates,
} from "@/features/workout/logic/rankActivityRescheduleCandidates";

import {
  fitnessOsTrainingPlan,
} from "@/features/workout/trainingPlan";

import type {
  TrainingPlanState,
} from "@/features/workout/types";


export default function RescheduleCandidateRankingTestPage() {
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
    rankActivityRescheduleCandidates({
      state,

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

      unavailableDates: [
        "2026-08-24",
      ],
    });


  const first =
    ranked[0];

  const tuesday =
    ranked.find(
      (candidate) =>
        candidate.date ===
        "2026-08-25"
    );

  const wednesday =
    ranked.find(
      (candidate) =>
        candidate.date ===
        "2026-08-26"
    );

  const friday =
    ranked.find(
      (candidate) =>
        candidate.date ===
        "2026-08-28"
    );


  const passed =
    ranked.length ===
      5 &&

    first !==
      undefined &&

    // In this steady-state week, there is intentionally no
    // conflict-free destination for Monday Gym A if every other
    // prescribed activity remains fixed.
    ranked.every(
      (candidate) =>
        candidate.status ===
        "Avoid"
    ) &&

    // Saturday is the least-bad single-activity move because it
    // creates one consecutive-strength conflict rather than the
    // larger hard-session stacks created by the other options.
    first.date ===
      "2026-08-29" &&

    first.hasHighConflict ===
      true &&

    first.conflicts.length ===
      1 &&

    first.conflicts[0]?.kind ===
      "ConsecutiveStrength" &&

    tuesday !==
      undefined &&

    tuesday.status ===
      "Avoid" &&

    wednesday !==
      undefined &&

    wednesday.status ===
      "Avoid" &&

    friday !==
      undefined &&

    friday.status ===
      "Avoid";


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
        Reschedule Candidate Ranking Test
      </h1>

      <pre>
        {JSON.stringify(
          {
            ranked,
            first,
            tuesday,
            wednesday,
            friday,
            passed,
          },
          null,
          2
        )}
      </pre>
    </main>
  );
}