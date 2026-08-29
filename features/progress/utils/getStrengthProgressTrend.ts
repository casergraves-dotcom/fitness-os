import type {
  ExerciseProgressEntry,
} from "../hooks/useExerciseProgress";


// ============================================================
// Types
// ============================================================

export type StrengthProgressTrendStatus =
  | "InsufficientData"
  | "Improving"
  | "Maintained"
  | "Declining";


export interface StrengthProgressTrend {
  status:
    StrengthProgressTrendStatus;

  firstEstimatedOneRepMax:
    number | null;

  latestEstimatedOneRepMax:
    number | null;

  changePercent:
    number | null;

  sampleCount:
    number;
}


// ============================================================
// Strength Progress Trend
// ============================================================

export function getStrengthProgressTrend(
  progress:
    ExerciseProgressEntry[]
): StrengthProgressTrend {
  if (
    progress.length <
    2
  ) {
    return {
      status:
        "InsufficientData",

      firstEstimatedOneRepMax:
        progress[0]
          ?.estimatedOneRepMax ??
        null,

      latestEstimatedOneRepMax:
        progress[0]
          ?.estimatedOneRepMax ??
        null,

      changePercent:
        null,

      sampleCount:
        progress.length,
    };
  }


  const chronological =
    [
      ...progress,
    ].sort(
      (
        a,
        b
      ) =>
        new Date(
          a.date
        ).getTime() -
        new Date(
          b.date
        ).getTime()
    );


  const first =
    chronological[0]
      .estimatedOneRepMax;

  const latest =
    chronological[
      chronological.length -
        1
    ].estimatedOneRepMax;


  if (
    first <=
    0
  ) {
    return {
      status:
        "InsufficientData",

      firstEstimatedOneRepMax:
        first,

      latestEstimatedOneRepMax:
        latest,

      changePercent:
        null,

      sampleCount:
        chronological.length,
    };
  }


  const changePercent =
    (
      (
        latest -
        first
      ) /
      first
    ) *
    100;


  let status:
    StrengthProgressTrendStatus;


  if (
    changePercent >
    5
  ) {
    status =
      "Improving";
  } else if (
    changePercent <
    -5
  ) {
    status =
      "Declining";
  } else {
    status =
      "Maintained";
  }


  return {
    status,

    firstEstimatedOneRepMax:
      first,

    latestEstimatedOneRepMax:
      latest,

    changePercent,

    sampleCount:
      chronological.length,
  };
}