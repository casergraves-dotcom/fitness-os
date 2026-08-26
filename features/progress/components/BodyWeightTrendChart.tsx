"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  BodyWeightTrendEntry,
} from "../hooks/useBodyCompositionTrends";


// ============================================================
// Props
// ============================================================

interface BodyWeightTrendChartProps {
  trend:
    BodyWeightTrendEntry[];
}


// ============================================================
// Helpers
// ============================================================

function formatDate(
  date:
    string
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month:
        "short",

      day:
        "numeric",
    }
  ).format(
    new Date(
      `${date}T12:00:00`
    )
  );
}


// ============================================================
// Body Weight Trend Chart
// ============================================================

export default function BodyWeightTrendChart({
  trend,
}: BodyWeightTrendChartProps) {

  const chartData =
    trend.map(
      (
        entry
      ) => ({
        date:
          formatDate(
            entry.date
          ),

        rawWeight:
          entry.weightLb,

        trendWeight:
          entry.trendWeightLb,

        sampleCount:
          entry.sampleCount,
      })
    );


  if (
    chartData.length <
    2
  ) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-slate-50 px-6 text-center">

        <div>

          <p className="font-semibold text-slate-700">
            Not enough data yet
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Add another body-weight measurement to begin charting your trend.
          </p>

        </div>

      </div>
    );
  }


  return (
    <div className="h-72 w-full">

      <ResponsiveContainer
        width="100%"
        height="100%"
      >

        <LineChart
          data={
            chartData
          }
          margin={{
            top:
              10,

            right:
              10,

            left:
              -10,

            bottom:
              0,
          }}
        >

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={
              false
            }
          />


          <XAxis
            dataKey="date"
            tickLine={
              false
            }
            axisLine={
              false
            }
            fontSize={
              12
            }
          />


          <YAxis
            tickLine={
              false
            }
            axisLine={
              false
            }
            fontSize={
              12
            }
            unit=" lb"
            domain={[
              "auto",
              "auto",
            ]}
          />


          <Tooltip
            formatter={(
              value,
              name,
              props
            ) => {
              if (
                name ===
                "7-Day Trend"
              ) {
                return [
                  `${value} lb`,
                  "7-Day Trend",
                ];
              }

              if (
                name ===
                "Raw Weight"
              ) {
                return [
                  `${value} lb`,
                  "Raw Weight",
                ];
              }

              return [
                value,
                name,
              ];
            }}
            labelFormatter={(
              label
            ) =>
              `Date: ${label}`
            }
          />


          <Line
            type="monotone"
            dataKey="rawWeight"
            name="Raw Weight"
            stroke="#94a3b8"
            strokeWidth={
              2
            }
            dot={{
              r:
                3,
            }}
            activeDot={{
              r:
                5,
            }}
          />


          <Line
            type="monotone"
            dataKey="trendWeight"
            name="7-Day Trend"
            stroke="#2563eb"
            strokeWidth={
              3
            }
            dot={{
              r:
                4,

              fill:
                "#2563eb",
            }}
            activeDot={{
              r:
                6,
            }}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>
  );
}