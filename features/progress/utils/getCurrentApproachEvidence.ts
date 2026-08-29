import type {
  BodyWeightTrendEntry,
} from "../hooks/useBodyCompositionTrends";

import type {
  TrainingPlanState,
} from "@/features/workout/types";


// ============================================================
// Types
// ============================================================

export type CurrentApproachEvidenceStatus =
  | "NoActiveProgram"
  | "TooEarly"
  | "InsufficientCurrentProgramData"
  | "Ready";


export interface CurrentApproachEvidence {
  status:
    CurrentApproachEvidenceStatus;

  programStartDate:
    string | null;

  programAgeDays:
    number | null;

  latestHistoricalEvidenceDate:
    string | null;

  latestCurrentProgramEvidenceDate:
    string | null;

  currentProgramEvidenceFreshnessDays:
    number | null;

  currentProgramEvidenceSpanDays:
    number;

  currentProgramSampleCount:
    number;

  historicalTrendAvailable:
    boolean;

  reason: string;
}


// ============================================================
// Constants
// ============================================================

// Require four weeks under the active program before judging
// whether the current approach appears to be working.
//
// Historical trends can still be described before this point,
// but they should not be attributed to the new program.
export const MIN_CURRENT_PROGRAM_AGE_DAYS =
  28;


// Require at least two weeks between current-program evidence
// points before using them to evaluate the approach.
export const MIN_CURRENT_PROGRAM_EVIDENCE_SPAN_DAYS =
  14;


// Evidence older than two weeks should not be presented as a
// fresh evaluation of the current approach.
export const MAX_CURRENT_PROGRAM_EVIDENCE_AGE_DAYS =
  14;


// ============================================================
// Date Helpers
// ============================================================

function parseLocalDate(
  value:
    string
) {
  const date =
    new Date(
      `${value}T12:00:00`
    );

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;
}


function formatLocalDate(
  date:
    Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() +
        1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    );

  return (
    `${year}-${month}-${day}`
  );
}


function getDayDifference(
  laterDate:
    string,
  earlierDate:
    string
) {
  const later =
    parseLocalDate(
      laterDate
    );

  const earlier =
    parseLocalDate(
      earlierDate
    );

  if (
    !later ||
    !earlier
  ) {
    return null;
  }

  return Math.max(
    0,
    Math.round(
      (
        later.getTime() -
        earlier.getTime()
      ) /
        (
          1000 *
          60 *
          60 *
          24
        )
    )
  );
}


// ============================================================
// Current Approach Evidence
// ============================================================

export function getCurrentApproachEvidence({
  trainingPlanState,
  weightTrend,
  currentDate =
    new Date(),
}: {
  trainingPlanState:
    TrainingPlanState | null;

  weightTrend:
    BodyWeightTrendEntry[];

  currentDate?:
    Date;
}): CurrentApproachEvidence {
  const today =
    formatLocalDate(
      currentDate
    );

  const chronologicalTrend =
    [
      ...weightTrend,
    ]
      .filter(
        (
          entry
        ) =>
          parseLocalDate(
            entry.date
          ) !==
          null
      )
      .sort(
        (
          a,
          b
        ) =>
          a.date.localeCompare(
            b.date
          )
      );

  const latestHistoricalEvidenceDate =
    chronologicalTrend.length >
    0
      ? chronologicalTrend[
          chronologicalTrend.length -
            1
        ].date
      : null;

  const historicalTrendAvailable =
    chronologicalTrend.length >=
    2;


  // ----------------------------------------------------------
  // Active Program
  // ----------------------------------------------------------

  if (
    !trainingPlanState
  ) {
    return {
      status:
        "NoActiveProgram",

      programStartDate:
        null,

      programAgeDays:
        null,

      latestHistoricalEvidenceDate,

      latestCurrentProgramEvidenceDate:
        null,

      currentProgramEvidenceFreshnessDays:
        null,

      currentProgramEvidenceSpanDays:
        0,

      currentProgramSampleCount:
        0,

      historicalTrendAvailable,

      reason:
        "There is no active training program to evaluate. Historical measurement trends can still be reviewed separately.",
    };
  }

  const programStartDate =
    trainingPlanState
      .startDate;

  const programAgeDays =
    getDayDifference(
      today,
      programStartDate
    );

  const currentProgramTrend =
    chronologicalTrend.filter(
      (
        entry
      ) =>
        entry.date >=
          programStartDate &&
        entry.date <=
          today
    );

  const currentProgramSampleCount =
    currentProgramTrend.length;

  const firstCurrentProgramEvidenceDate =
    currentProgramSampleCount >
    0
      ? currentProgramTrend[0]
          .date
      : null;

  const latestCurrentProgramEvidenceDate =
    currentProgramSampleCount >
    0
      ? currentProgramTrend[
          currentProgramSampleCount -
            1
        ].date
      : null;

  const currentProgramEvidenceSpanDays =
    firstCurrentProgramEvidenceDate &&
    latestCurrentProgramEvidenceDate
      ? getDayDifference(
          latestCurrentProgramEvidenceDate,
          firstCurrentProgramEvidenceDate
        ) ??
        0
      : 0;

  const currentProgramEvidenceFreshnessDays =
    latestCurrentProgramEvidenceDate
      ? getDayDifference(
          today,
          latestCurrentProgramEvidenceDate
        )
      : null;


  // ----------------------------------------------------------
  // Program Age
  // ----------------------------------------------------------

  if (
    programAgeDays ===
    null ||
    programAgeDays <
      MIN_CURRENT_PROGRAM_AGE_DAYS
  ) {
    return {
      status:
        "TooEarly",

      programStartDate,

      programAgeDays,

      latestHistoricalEvidenceDate,

      latestCurrentProgramEvidenceDate,

      currentProgramEvidenceFreshnessDays,

      currentProgramEvidenceSpanDays,

      currentProgramSampleCount,

      historicalTrendAvailable,

      reason:
        "The current training program has not been active long enough to evaluate its effect. Older measurement trends remain useful historical context.",
    };
  }


  // ----------------------------------------------------------
  // Current-Program Coverage
  // ----------------------------------------------------------

  if (
    currentProgramSampleCount <
    2
  ) {
    return {
      status:
        "InsufficientCurrentProgramData",

      programStartDate,

      programAgeDays,

      latestHistoricalEvidenceDate,

      latestCurrentProgramEvidenceDate,

      currentProgramEvidenceFreshnessDays,

      currentProgramEvidenceSpanDays,

      currentProgramSampleCount,

      historicalTrendAvailable,

      reason:
        "More body-composition evidence collected during the current program is needed before evaluating the approach.",
    };
  }

  if (
    currentProgramEvidenceSpanDays <
    MIN_CURRENT_PROGRAM_EVIDENCE_SPAN_DAYS
  ) {
    return {
      status:
        "InsufficientCurrentProgramData",

      programStartDate,

      programAgeDays,

      latestHistoricalEvidenceDate,

      latestCurrentProgramEvidenceDate,

      currentProgramEvidenceFreshnessDays,

      currentProgramEvidenceSpanDays,

      currentProgramSampleCount,

      historicalTrendAvailable,

      reason:
        "The available current-program measurements do not yet span enough time to evaluate the approach.",
    };
  }

  if (
    currentProgramEvidenceFreshnessDays ===
      null ||
    currentProgramEvidenceFreshnessDays >
      MAX_CURRENT_PROGRAM_EVIDENCE_AGE_DAYS
  ) {
    return {
      status:
        "InsufficientCurrentProgramData",

      programStartDate,

      programAgeDays,

      latestHistoricalEvidenceDate,

      latestCurrentProgramEvidenceDate,

      currentProgramEvidenceFreshnessDays,

      currentProgramEvidenceSpanDays,

      currentProgramSampleCount,

      historicalTrendAvailable,

      reason:
        "The current-program body-composition evidence is not recent enough to evaluate the approach confidently.",
    };
  }


  // ----------------------------------------------------------
  // Ready
  // ----------------------------------------------------------

  return {
    status:
      "Ready",

    programStartDate,

    programAgeDays,

    latestHistoricalEvidenceDate,

    latestCurrentProgramEvidenceDate,

    currentProgramEvidenceFreshnessDays,

    currentProgramEvidenceSpanDays,

    currentProgramSampleCount,

    historicalTrendAvailable,

    reason:
      "The current program has enough recent body-composition evidence over a meaningful time span to evaluate the approach.",
  };
}