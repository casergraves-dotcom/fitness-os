import {
  getWeeklyScheduleRearrangementOptions,
} from "@/features/workout/logic/getWeeklyScheduleRearrangementOptions";

import {
  searchAdaptiveWeeklyRearrangements,
} from "@/features/workout/logic/searchAdaptiveWeeklyRearrangements";

import {
  fitnessOsTrainingPlan,
} from "@/features/workout/trainingPlan";

import type {
  TrainingPlanState,
} from "@/features/workout/types";


export default function AdaptiveBoundedSearchTestPage() {
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


  const weekStartDate =
    "2026-08-24";


  const unavailableDates = [
    "2026-08-24",
  ];


  const options =
    getWeeklyScheduleRearrangementOptions({
      state,

      weekStartDate,

      unavailableDates,
    });


  // ----------------------------------------------------------
  // Tiny Bounded Search
  // ----------------------------------------------------------
  //
  // This is intentionally small.
  //
  // We are testing that the bounded-search architecture can
  // produce/evaluate candidates without exploding the request
  // time.
  //
  // This is NOT yet a recommendation-quality search.

  const bounded =
    searchAdaptiveWeeklyRearrangements({
      state,

      weekStartDate,

      activities:
        options,

      unavailableDates,

      beamWidth:
        5,

      maxEvaluations:
        120,

      maxResults:
        5,
    });


  const best =
    bounded[0];


  const hasResults =
    bounded.length >
      0;


  const finiteScores =
    bounded.every(
      (candidate) =>
        Number.isFinite(
          candidate.score
        )
    );


  const passed =
    options.length ===
      4 &&

    hasResults &&

    finiteScores;


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
        Adaptive Bounded Search Smoke Test
      </h1>

      <pre>
        {JSON.stringify(
          {
            optionCount:
              options.length,

            resultCount:
              bounded.length,

            best,

            results:
              bounded,

            passed,
          },
          null,
          2
        )}
      </pre>
    </main>
  );
}