"use client";

import { useMemo } from "react";

import type {
  BodyMeasurement,
} from "../bodyCompositionTypes";


// ============================================================
// Types
// ============================================================

export interface BodyWeightTrendEntry {
  measurementId: string;

  date: string;

  // Raw recorded weight from the source BodyMeasurement.
  weightLb: number;

  // Calculated rolling-average weight. This value is derived and
  // intentionally is not persisted back into measurement history.
  trendWeightLb: number;

  // Number of recorded weight measurements included in this
  // rolling trend point.
  sampleCount: number;
}


export interface BodyWeightTrendSummary {
  latestRawWeightLb?: number;

  latestTrendWeightLb?: number;

  previousTrendWeightLb?: number;

  trendChangeLb?: number;

  firstTrendWeightLb?: number;

  totalTrendChangeLb?: number;
}


// ============================================================
// Constants
// ============================================================

// Use a seven-calendar-day trailing window rather than the last
// seven measurements. This keeps the trend meaningful even when
// weigh-ins are not recorded every day.
const WEIGHT_TREND_WINDOW_DAYS =
  7;


// ============================================================
// Helpers
// ============================================================

function parseLocalDate(
  date:
    string
) {
  return new Date(
    `${date}T12:00:00`
  );
}


function getDayDifference(
  laterDate:
    string,
  earlierDate:
    string
) {
  const millisecondsPerDay =
    24 *
    60 *
    60 *
    1000;

  return (
    parseLocalDate(
      laterDate
    ).getTime() -
    parseLocalDate(
      earlierDate
    ).getTime()
  ) /
    millisecondsPerDay;
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
// Hook
// ============================================================

export function useBodyCompositionTrends(
  measurements:
    BodyMeasurement[]
) {

  // ----------------------------------------------------------
  // Weight Measurements
  // ----------------------------------------------------------

  const weightMeasurements =
    useMemo(
      () =>
        measurements
          .filter(
            (
              measurement
            ) =>
              measurement.weightLb !==
                undefined &&
              measurement.weightLb >
                0
          )
          .sort(
            (
              a,
              b
            ) =>
              a.date.localeCompare(
                b.date
              ) ||
              a.createdAt.localeCompare(
                b.createdAt
              )
          ),
      [
        measurements,
      ]
    );


  // ----------------------------------------------------------
  // Weight Trend
  // ----------------------------------------------------------

  const weightTrend =
    useMemo<
      BodyWeightTrendEntry[]
    >(
      () => {
        const entries:
          BodyWeightTrendEntry[] =
          [];

        for (
          let index = 0;
          index <
          weightMeasurements.length;
          index += 1
        ) {
          const current =
            weightMeasurements[
              index
            ];

          const windowMeasurements =
            weightMeasurements.filter(
              (
                measurement,
                candidateIndex
              ) => {
                if (
                  candidateIndex >
                  index
                ) {
                  return false;
                }

                const dayDifference =
                  getDayDifference(
                    current.date,
                    measurement.date
                  );

                return (
                  dayDifference >=
                    0 &&
                  dayDifference <
                    WEIGHT_TREND_WINDOW_DAYS
                );
              }
            );

          const totalWeight =
            windowMeasurements.reduce(
              (
                total,
                measurement
              ) =>
                total +
                (
                  measurement.weightLb ??
                  0
                ),
              0
            );

          const trendWeightLb =
            totalWeight /
            windowMeasurements.length;

          entries.push({
            measurementId:
              current.id,

            date:
              current.date,

            weightLb:
              current.weightLb!,

            trendWeightLb:
              roundToTenth(
                trendWeightLb
              ),

            sampleCount:
              windowMeasurements.length,
          });
        }

        return entries;
      },
      [
        weightMeasurements,
      ]
    );


  // ----------------------------------------------------------
  // Weight Trend Summary
  // ----------------------------------------------------------

  const weightTrendSummary =
    useMemo<
      BodyWeightTrendSummary
    >(
      () => {
        if (
          weightTrend.length ===
          0
        ) {
          return {};
        }

        const latest =
          weightTrend[
            weightTrend.length -
            1
          ];

        const first =
          weightTrend[0];

        // Use the most recent trend point at least seven calendar
        // days before the latest point for a weekly comparison.
        const previous =
          [...weightTrend]
            .reverse()
            .find(
              (
                entry
              ) =>
                getDayDifference(
                  latest.date,
                  entry.date
                ) >=
                WEIGHT_TREND_WINDOW_DAYS
            );

        return {
          latestRawWeightLb:
            latest.weightLb,

          latestTrendWeightLb:
            latest.trendWeightLb,

          previousTrendWeightLb:
            previous?.trendWeightLb,

          trendChangeLb:
            previous
              ? roundToTenth(
                  latest.trendWeightLb -
                    previous.trendWeightLb
                )
              : undefined,

          firstTrendWeightLb:
            first.trendWeightLb,

          totalTrendChangeLb:
            weightTrend.length >
            1
              ? roundToTenth(
                  latest.trendWeightLb -
                    first.trendWeightLb
                )
              : undefined,
        };
      },
      [
        weightTrend,
      ]
    );


  // ----------------------------------------------------------
  // Public API
  // ----------------------------------------------------------

  return {
    weightMeasurements,

    weightTrend,

    weightTrendSummary,
  };
}
