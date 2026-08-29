import type {
  CurrentApproachEvidence,
} from "./getCurrentApproachEvidence";

import type {
  ProgressReviewPeriod,
} from "./getProgressReviewPeriod";


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
// Current-Program Review Period
// ============================================================

export function getCurrentProgramReviewPeriod({
  evidence,
  currentDate =
    new Date(),
}: {
  evidence:
    CurrentApproachEvidence;

  currentDate?:
    Date;
}): ProgressReviewPeriod | null {
  const startDate =
    evidence.programStartDate;

  if (
    !startDate ||
    !parseLocalDate(
      startDate
    )
  ) {
    return null;
  }

  const endDate =
    formatLocalDate(
      currentDate
    );

  const inclusiveDayCount =
    getInclusiveDayCount(
      startDate,
      endDate
    );

  if (
    inclusiveDayCount ===
    null
  ) {
    return null;
  }

  return {
    range:
      "CurrentProgram",

    label:
      "Current program",

    startDate,

    endDate,

    inclusiveDayCount,
  };
}
