import type {
  BodyWeightTrendEntry,
} from "../hooks/useBodyCompositionTrends";

import {
  filterRecordsByProgressReviewPeriod,
} from "./getProgressReviewPeriod";

import type {
  ProgressReviewPeriod,
} from "./getProgressReviewPeriod";


// ============================================================
// Types
// ============================================================

export type BodyCompositionPeriodComparisonStatus =
  | "InsufficientData"
  | "Comparable";


export interface BodyCompositionPeriodSummary {
  startDate:
    string | null;

  endDate:
    string | null;

  firstTrendWeightLb:
    number | null;

  latestTrendWeightLb:
    number | null;

  changeLb:
    number | null;

  weeklyChangeLb:
    number | null;

  sampleCount: number;

  evidenceSpanDays: number;
}


export interface BodyCompositionPeriodComparison {
  status:
    BodyCompositionPeriodComparisonStatus;

  currentPeriod:
    ProgressReviewPeriod;

  previousPeriod:
    ProgressReviewPeriod |
    null;

  current:
    BodyCompositionPeriodSummary;

  previous:
    BodyCompositionPeriodSummary;

  weeklyRateDifferenceLb:
    number | null;

  reason: string;
}


// ============================================================
// Constants
// ============================================================

// Each side of the comparison must represent at least two weeks.
// This prevents two nearby measurements from being presented as
// a meaningful longer-term comparison.
const MIN_COMPARISON_EVIDENCE_SPAN_DAYS =
  14;


// ============================================================
// Helpers
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


function addDays(
  date:
    Date,
  dayCount:
    number
) {
  const result =
    new Date(
      date
    );

  result.setDate(
    result.getDate() +
      dayCount
  );

  return result;
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
    return 0;
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


function roundToTenth(
  value:
    number
) {
  return (
    Math.round(
      value *
      10
    ) /
    10
  );
}


function getEmptySummary():
  BodyCompositionPeriodSummary {
  return {
    startDate:
      null,

    endDate:
      null,

    firstTrendWeightLb:
      null,

    latestTrendWeightLb:
      null,

    changeLb:
      null,

    weeklyChangeLb:
      null,

    sampleCount:
      0,

    evidenceSpanDays:
      0,
  };
}


function getPeriodSummary(
  entries:
    BodyWeightTrendEntry[]
): BodyCompositionPeriodSummary {
  const chronological =
    [
      ...entries,
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

  if (
    chronological.length ===
    0
  ) {
    return getEmptySummary();
  }

  const first =
    chronological[0];

  const latest =
    chronological[
      chronological.length -
        1
    ];

  const evidenceSpanDays =
    getDayDifference(
      latest.date,
      first.date
    );

  const changeLb =
    roundToTenth(
      latest.trendWeightLb -
      first.trendWeightLb
    );

  const weeklyChangeLb =
    evidenceSpanDays >
    0
      ? roundToTenth(
          changeLb /
            (
              evidenceSpanDays /
              7
            )
        )
      : null;

  return {
    startDate:
      first.date,

    endDate:
      latest.date,

    firstTrendWeightLb:
      first.trendWeightLb,

    latestTrendWeightLb:
      latest.trendWeightLb,

    changeLb,

    weeklyChangeLb,

    sampleCount:
      chronological.length,

    evidenceSpanDays,
  };
}


function getPreviousPeriod(
  currentPeriod:
    ProgressReviewPeriod
): ProgressReviewPeriod | null {
  if (
    currentPeriod.range ===
      "All" ||
    !currentPeriod.startDate ||
    !currentPeriod.inclusiveDayCount
  ) {
    return null;
  }

  const currentStart =
    parseLocalDate(
      currentPeriod.startDate
    );

  if (!currentStart) {
    return null;
  }

  const previousEnd =
    addDays(
      currentStart,
      -1
    );

  const previousStart =
    addDays(
      previousEnd,
      -(
        currentPeriod
          .inclusiveDayCount -
        1
      )
    );

  return {
    range:
      currentPeriod.range,

    label:
      `Previous ${currentPeriod.label.toLowerCase()}`,

    startDate:
      formatLocalDate(
        previousStart
      ),

    endDate:
      formatLocalDate(
        previousEnd
      ),

    inclusiveDayCount:
      currentPeriod
        .inclusiveDayCount,
  };
}


// ============================================================
// Body-Composition Period Comparison
// ============================================================

export function getBodyCompositionPeriodComparison({
  weightTrend,
  currentPeriod,
}: {
  weightTrend:
    BodyWeightTrendEntry[];

  currentPeriod:
    ProgressReviewPeriod;
}): BodyCompositionPeriodComparison {
  const previousPeriod =
    getPreviousPeriod(
      currentPeriod
    );

  const currentEntries =
    filterRecordsByProgressReviewPeriod(
      weightTrend,
      (
        entry
      ) =>
        entry.date,
      currentPeriod
    );

  const previousEntries =
    previousPeriod
      ? filterRecordsByProgressReviewPeriod(
          weightTrend,
          (
            entry
          ) =>
            entry.date,
          previousPeriod
        )
      : [];

  const current =
    getPeriodSummary(
      currentEntries
    );

  const previous =
    getPeriodSummary(
      previousEntries
    );


  // ----------------------------------------------------------
  // Comparable Window Availability
  // ----------------------------------------------------------

  if (
    !previousPeriod
  ) {
    return {
      status:
        "InsufficientData",

      currentPeriod,

      previousPeriod,

      current,

      previous,

      weeklyRateDifferenceLb:
        null,

      reason:
        "All-history review does not have an equally sized preceding period for comparison.",
    };
  }

  if (
    current.sampleCount <
      2 ||
    previous.sampleCount <
      2
  ) {
    return {
      status:
        "InsufficientData",

      currentPeriod,

      previousPeriod,

      current,

      previous,

      weeklyRateDifferenceLb:
        null,

      reason:
        "A like-for-like rate comparison needs at least two body-composition trend points in each period; one or both periods do not yet meet that requirement.",
    };
  }

  if (
    current.evidenceSpanDays <
      MIN_COMPARISON_EVIDENCE_SPAN_DAYS ||
    previous.evidenceSpanDays <
      MIN_COMPARISON_EVIDENCE_SPAN_DAYS
  ) {
    return {
      status:
        "InsufficientData",

      currentPeriod,

      previousPeriod,

      current,

      previous,

      weeklyRateDifferenceLb:
        null,

      reason:
        "Both periods need body-composition evidence spanning at least two weeks before their rates can be compared.",
    };
  }

  if (
    current.weeklyChangeLb ===
      null ||
    previous.weeklyChangeLb ===
      null
  ) {
    return {
      status:
        "InsufficientData",

      currentPeriod,

      previousPeriod,

      current,

      previous,

      weeklyRateDifferenceLb:
        null,

      reason:
        "The available body-composition evidence does not support a normalized rate comparison.",
    };
  }


  // ----------------------------------------------------------
  // Comparable Result
  // ----------------------------------------------------------

  return {
    status:
      "Comparable",

    currentPeriod,

    previousPeriod,

    current,

    previous,

    weeklyRateDifferenceLb:
      roundToTenth(
        current.weeklyChangeLb -
        previous.weeklyChangeLb
      ),

    reason:
      "The selected period and the equally sized preceding period both contain sufficient body-composition trend evidence for comparison.",
  };
}