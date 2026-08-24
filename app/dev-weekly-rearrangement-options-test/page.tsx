import {
  getWeeklyScheduleRearrangementOptions,
} from "@/features/workout/logic/getWeeklyScheduleRearrangementOptions";

import {
  fitnessOsTrainingPlan,
} from "@/features/workout/trainingPlan";

import type {
  TrainingPlanState,
} from "@/features/workout/types";


export default function WeeklyRearrangementOptionsTestPage() {
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


  const options =
    getWeeklyScheduleRearrangementOptions({
      state,

      weekStartDate:
        "2026-08-24",

      unavailableDates: [
        "2026-08-24",
      ],
    });


  const ids =
    options.map(
      (option) =>
        option.trainingActivityId
    );


  const gymA =
    options.find(
      (option) =>
        option.trainingActivityId ===
        "steady-monday-gym-a"
    );


  const mondayZone2 =
    options.find(
      (option) =>
        option.trainingActivityId ===
        "steady-monday-zone-2"
    );


  const gymB =
    options.find(
      (option) =>
        option.trainingActivityId ===
        "steady-wednesday-gym-b"
    );


  const gymC =
    options.find(
      (option) =>
        option.trainingActivityId ===
        "steady-friday-gym-c"
    );


  const passed =
    options.length ===
      4 &&

    gymA !==
      undefined &&

    mondayZone2 !==
      undefined &&

    gymB !==
      undefined &&

    gymC !==
      undefined &&

    // Required Monday activities must not be offered Monday as
    // a destination.
    gymA.candidateDates.includes(
      "2026-08-24"
    ) ===
      false &&

    mondayZone2.candidateDates.includes(
      "2026-08-24"
    ) ===
      false &&

    // The other available dates should remain candidates.
    gymA.candidateDates.includes(
      "2026-08-25"
    ) &&

    mondayZone2.candidateDates.includes(
      "2026-08-29"
    ) &&

    // We should not yet pull unrelated optional activities into
    // the search.
    ids.includes(
      "steady-tuesday-aerial"
    ) ===
      false &&

    ids.includes(
      "steady-tuesday-run"
    ) ===
      false &&

    ids.includes(
      "steady-thursday-aerial"
    ) ===
      false;


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
        Weekly Rearrangement Options Test
      </h1>

      <pre>
        {JSON.stringify(
          {
            options,
            ids,
            passed,
          },
          null,
          2
        )}
      </pre>
    </main>
  );
}