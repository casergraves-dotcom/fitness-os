import type {
  RunSession,
} from "@/features/workout/types";


// ============================================================
// Types
// ============================================================

export type RunningProgressTrendStatus =
  | "InsufficientData"
  | "Improving"
  | "Maintained"
  | "Declining";


export interface RunningProgressTrend {
  status:
    RunningProgressTrendStatus;

  firstPaceMinutesPerMile:
    number | null;

  latestPaceMinutesPerMile:
    number | null;

  changePercent:
    number | null;

  sampleCount:
    number;
}


// ============================================================
// Running Progress Trend
// ============================================================

export function getRunningProgressTrend(
  runHistory:
    RunSession[]
): RunningProgressTrend {
  const runsWithPace =
    runHistory.filter(
      (
        run
      ) =>
        run.durationMinutes !==
          undefined &&
        run.durationMinutes >
          0 &&
        run.distanceMiles !==
          undefined &&
        run.distanceMiles >
          0
    );


  if (
    runsWithPace.length <
    2
  ) {
    const onlyRun =
      runsWithPace[0];

    const onlyPace =
      onlyRun
        ? onlyRun.durationMinutes! /
          onlyRun.distanceMiles!
        : null;

    return {
      status:
        "InsufficientData",

      firstPaceMinutesPerMile:
        onlyPace,

      latestPaceMinutesPerMile:
        onlyPace,

      changePercent:
        null,

      sampleCount:
        runsWithPace.length,
    };
  }


  const chronological =
    [
      ...runsWithPace,
    ].sort(
      (
        a,
        b
      ) =>
        (
          a.completedAt ??
          a.startedAt
        ).localeCompare(
          b.completedAt ??
          b.startedAt
        )
    );


  const first =
    chronological[0];

  const latest =
    chronological[
      chronological.length -
        1
    ];


  const firstPace =
    first.durationMinutes! /
    first.distanceMiles!;

  const latestPace =
    latest.durationMinutes! /
    latest.distanceMiles!;


  if (
    firstPace <=
    0
  ) {
    return {
      status:
        "InsufficientData",

      firstPaceMinutesPerMile:
        firstPace,

      latestPaceMinutesPerMile:
        latestPace,

      changePercent:
        null,

      sampleCount:
        chronological.length,
    };
  }


  // Lower pace is faster, so improvement is first - latest.
  const changePercent =
    (
      (
        firstPace -
        latestPace
      ) /
      firstPace
    ) *
    100;


  let status:
    RunningProgressTrendStatus;


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

    firstPaceMinutesPerMile:
      firstPace,

    latestPaceMinutesPerMile:
      latestPace,

    changePercent,

    sampleCount:
      chronological.length,
  };
}