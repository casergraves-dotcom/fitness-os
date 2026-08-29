// ============================================================
// Types
// ============================================================

export type ProgressReviewRange =
  | "4W"
  | "12W"
  | "6M"
  | "1Y"
  | "All";


export type ProgressReviewPeriodRange =
  | ProgressReviewRange
  | "CurrentProgram";


export interface ProgressReviewPeriod {
  range:
    ProgressReviewPeriodRange;

  label: string;

  startDate:
    string | null;

  endDate: string;

  inclusiveDayCount:
    number | null;
}


// ============================================================
// Constants
// ============================================================

export const DEFAULT_PROGRESS_REVIEW_RANGE:
  ProgressReviewRange =
    "12W";


const RANGE_DAY_COUNTS:
  Partial<
    Record<
      ProgressReviewRange,
      number
    >
  > = {
    "4W":
      28,

    "12W":
      84,

    "6M":
      183,

    "1Y":
      365,
  };


const RANGE_LABELS:
  Record<
    ProgressReviewRange,
    string
  > = {
    "4W":
      "Last 4 weeks",

    "12W":
      "Last 12 weeks",

    "6M":
      "Last 6 months",

    "1Y":
      "Last year",

    "All":
      "All history",
  };


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


function getInclusiveDayCount(
  startDate:
    string,
  endDate:
    string
) {
  const start =
    parseLocalDate(
      startDate
    );

  const end =
    parseLocalDate(
      endDate
    );

  if (
    !start ||
    !end ||
    start >
      end
  ) {
    return null;
  }

  return (
    Math.round(
      (
        end.getTime() -
        start.getTime()
      ) /
        (
          1000 *
          60 *
          60 *
          24
        )
    ) +
    1
  );
}


// ============================================================
// Progress Review Period
// ============================================================

export function getProgressReviewPeriod({
  range =
    DEFAULT_PROGRESS_REVIEW_RANGE,
  currentDate =
    new Date(),
  earliestAvailableDate,
}: {
  range?:
    ProgressReviewRange;

  currentDate?:
    Date;

  earliestAvailableDate?:
    string | null;
} = {}): ProgressReviewPeriod {
  const endDate =
    formatLocalDate(
      currentDate
    );

  if (
    range ===
    "All"
  ) {
    const validEarliestDate =
      earliestAvailableDate &&
      parseLocalDate(
        earliestAvailableDate
      ) &&
      earliestAvailableDate <=
        endDate
        ? earliestAvailableDate
        : null;

    return {
      range,

      label:
        RANGE_LABELS[
          range
        ],

      startDate:
        validEarliestDate,

      endDate,

      inclusiveDayCount:
        validEarliestDate
          ? getInclusiveDayCount(
              validEarliestDate,
              endDate
            )
          : null,
    };
  }

  const dayCount =
    RANGE_DAY_COUNTS[
      range
    ]!;

  // Subtract dayCount - 1 because both boundaries are inclusive.
  const startDate =
    formatLocalDate(
      addDays(
        currentDate,
        -(
          dayCount -
          1
        )
      )
    );

  return {
    range,

    label:
      RANGE_LABELS[
        range
      ],

    startDate,

    endDate,

    inclusiveDayCount:
      dayCount,
  };
}


// ============================================================
// Period Membership
// ============================================================

export function isDateInProgressReviewPeriod(
  date:
    string,
  period:
    ProgressReviewPeriod
) {
  if (
    !parseLocalDate(
      date
    )
  ) {
    return false;
  }

  if (
    date >
    period.endDate
  ) {
    return false;
  }

  if (
    period.startDate &&
    date <
      period.startDate
  ) {
    return false;
  }

  return true;
}


// ============================================================
// Period Filtering
// ============================================================

export function filterRecordsByProgressReviewPeriod<
  T
>(
  records:
    T[],
  getDate:
    (
      record:
        T
    ) => string,
  period:
    ProgressReviewPeriod
) {
  return records.filter(
    (
      record
    ) =>
      isDateInProgressReviewPeriod(
        getDate(
          record
        ),
        period
      )
  );
}
