import type {
  DexaRecord,
} from "../bodyCompositionTypes";


// ============================================================
// Types
// ============================================================

export type DexaComparisonMetricKey =
  | "Weight"
  | "BodyFat"
  | "FatMass"
  | "LeanMass";


export interface DexaComparisonMetric {
  key:
    DexaComparisonMetricKey;

  label: string;

  unit:
    "lb" |
    "%";

  earlierValue: number;

  laterValue: number;

  change: number;
}


export interface DexaComparison {
  earlier:
    DexaRecord;

  later:
    DexaRecord;

  metrics:
    DexaComparisonMetric[];

  daySpan: number;
}


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


// ============================================================
// DEXA Comparison
// ============================================================

export function getDexaComparison(
  firstRecord:
    DexaRecord,
  secondRecord:
    DexaRecord
): DexaComparison {
  const chronological =
    firstRecord.scanDate.localeCompare(
      secondRecord.scanDate
    ) <=
    0
      ? {
          earlier:
            firstRecord,

          later:
            secondRecord,
        }
      : {
          earlier:
            secondRecord,

          later:
            firstRecord,
        };

  const candidateMetrics:
    Array<{
      key:
        DexaComparisonMetricKey;

      label:
        string;

      unit:
        "lb" |
        "%";

      earlierValue:
        number |
        undefined;

      laterValue:
        number |
        undefined;
    }> = [
      {
        key:
          "Weight",

        label:
          "Weight",

        unit:
          "lb",

        earlierValue:
          chronological
            .earlier
            .weightLb,

        laterValue:
          chronological
            .later
            .weightLb,
      },
      {
        key:
          "BodyFat",

        label:
          "Body Fat",

        unit:
          "%",

        earlierValue:
          chronological
            .earlier
            .bodyFatPercent,

        laterValue:
          chronological
            .later
            .bodyFatPercent,
      },
      {
        key:
          "FatMass",

        label:
          "Fat Mass",

        unit:
          "lb",

        earlierValue:
          chronological
            .earlier
            .fatMassLb,

        laterValue:
          chronological
            .later
            .fatMassLb,
      },
      {
        key:
          "LeanMass",

        label:
          "Lean Mass",

        unit:
          "lb",

        earlierValue:
          chronological
            .earlier
            .leanMassLb,

        laterValue:
          chronological
            .later
            .leanMassLb,
      },
    ];

  const metrics:
    DexaComparisonMetric[] =
      candidateMetrics
        .filter(
          (
            metric
          ): metric is {
            key:
              DexaComparisonMetricKey;

            label:
              string;

            unit:
              "lb" |
              "%";

            earlierValue:
              number;

            laterValue:
              number;
          } =>
            metric.earlierValue !==
              undefined &&
            metric.laterValue !==
              undefined
        )
        .map(
          (
            metric
          ) => ({
            key:
              metric.key,

            label:
              metric.label,

            unit:
              metric.unit,

            earlierValue:
              metric
                .earlierValue,

            laterValue:
              metric
                .laterValue,

            change:
              roundToTenth(
                metric
                  .laterValue -
                metric
                  .earlierValue
              ),
          })
        );

  return {
    earlier:
      chronological
        .earlier,

    later:
      chronological
        .later,

    metrics,

    daySpan:
      getDayDifference(
        chronological
          .later
          .scanDate,
        chronological
          .earlier
          .scanDate
      ),
  };
}