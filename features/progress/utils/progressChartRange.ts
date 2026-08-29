export type ProgressChartRange =
  "3m" |
  "6m" |
  "1y" |
  "all";


export const PROGRESS_CHART_RANGE_OPTIONS: Array<{
  value: ProgressChartRange;
  label: string;
}> = [
  {
    value: "3m",
    label: "3 months",
  },
  {
    value: "6m",
    label: "6 months",
  },
  {
    value: "1y",
    label: "1 year",
  },
  {
    value: "all",
    label: "All history",
  },
];


function formatLocalDate(
  date: Date
) {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
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

  return `${year}-${month}-${day}`;
}


export function getProgressChartRangeStartDate(
  latestDate: string | undefined,
  range: ProgressChartRange
) {
  if (
    !latestDate ||
    range === "all"
  ) {
    return undefined;
  }

  const startDate =
    new Date(
      `${latestDate}T12:00:00`
    );

  if (
    range === "1y"
  ) {
    startDate.setFullYear(
      startDate.getFullYear() - 1
    );
  } else {
    startDate.setMonth(
      startDate.getMonth() -
        (
          range === "3m"
            ? 3
            : 6
        )
    );
  }

  return formatLocalDate(
    startDate
  );
}


export function isDateInProgressChartRange(
  date: string,
  rangeStartDate: string | undefined
) {
  return (
    !rangeStartDate ||
    date >=
      rangeStartDate
  );
}
