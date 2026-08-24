import {
  classifyOptionalScheduleConflict,
} from "@/features/workout/logic/classifyOptionalScheduleConflict";

import type {
  ScheduleConflict,
} from "@/features/workout/logic/evaluateScheduleConflicts";


export default function OptionalConflictClassifierTestPage() {

  const requiredStrengthOptionalAerial:
    ScheduleConflict = {
      kind:
        "SameDayHardStack",

      severity:
        "High",

      first: {
        date:
          "2026-08-25",

        activity: {
          id:
            "gym-a",

          type:
            "Strength",

          label:
            "Gym A",

          strengthWorkout:
            "Gym A",
        },
      },

      second: {
        date:
          "2026-08-25",

        activity: {
          id:
            "aerial",

          type:
            "Aerial",

          label:
            "Aerial",

          optional:
            true,

          substitutionGroup:
            "easy-cardio",
        },
      },

      reason:
        "Test conflict.",
    };


  const requiredStrengthRequiredStrength:
    ScheduleConflict = {
      kind:
        "ConsecutiveStrength",

      severity:
        "High",

      first: {
        date:
          "2026-08-25",

        activity: {
          id:
            "gym-a",

          type:
            "Strength",

          label:
            "Gym A",

          strengthWorkout:
            "Gym A",
        },
      },

      second: {
        date:
          "2026-08-26",

        activity: {
          id:
            "gym-b",

          type:
            "Strength",

          label:
            "Gym B",

          strengthWorkout:
            "Gym B",
        },
      },

      reason:
        "Test conflict.",
    };


  const optionalResolution =
    classifyOptionalScheduleConflict(
      requiredStrengthOptionalAerial
    );


  const requiredResolution =
    classifyOptionalScheduleConflict(
      requiredStrengthRequiredStrength
    );


  const passed =
    optionalResolution.resolvable ===
      true &&

    optionalResolution.optionalActivity?.id ===
      "aerial" &&

    optionalResolution.requiredActivity?.id ===
      "gym-a" &&

    optionalResolution.substitutionGroup ===
      "easy-cardio" &&

    requiredResolution.resolvable ===
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
        Optional Conflict Classifier Test
      </h1>

      <pre>
        {JSON.stringify(
          {
            optionalResolution,

            requiredResolution,

            passed,
          },
          null,
          2
        )}
      </pre>
    </main>
  );
}