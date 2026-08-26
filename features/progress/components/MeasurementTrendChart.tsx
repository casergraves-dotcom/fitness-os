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


// ============================================================
// Types
// ============================================================

export interface MeasurementTrendPoint {
  date:
    string;

  value:
    number;
}


interface MeasurementTrendChartProps {
  data:
    MeasurementTrendPoint[];

  unit:
    string;

  label:
    string;

  emptyMessage:
    string;
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
// Measurement Trend Chart
// ============================================================

export default function MeasurementTrendChart({
  data,
  unit,
  label,
  emptyMessage,
}: MeasurementTrendChartProps) {

  const chartData =
    data.map(
      (
        entry
      ) => ({
        date:
          formatDate(
            entry.date
          ),

        value:
          entry.value,
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
            {emptyMessage}
          </p>

        </div>

      </div>
    );
  }


  return (
    <div className="h-64 w-full">

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
            domain={[
              "auto",
              "auto",
            ]}
          />


          <Tooltip
            formatter={(
              value
            ) => [
              `${value} ${unit}`,
              label,
            ]}
            labelFormatter={(
              date
            ) =>
              `Date: ${date}`
            }
          />


          <Line
            type="monotone"
            dataKey="value"
            name={
              label
            }
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