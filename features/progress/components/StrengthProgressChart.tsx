"use client";

// ============================================================
// Imports
// ============================================================

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
  ExerciseProgressEntry,
} from "../hooks/useExerciseProgress";

// ============================================================
// Props
// ============================================================

interface StrengthProgressChartProps {
  progress: ExerciseProgressEntry[];
}

// ============================================================
// Helpers
// ============================================================

function formatDate(date: string) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  ).format(new Date(date));
}

// ============================================================
// Strength Progress Chart
// ============================================================

export default function StrengthProgressChart({
  progress,
}: StrengthProgressChartProps) {
  // ----------------------------------------------------------
  // Chart Data
  // ----------------------------------------------------------

  const chartData = progress.map(
    (entry) => ({
      date: formatDate(entry.date),

      // Round the estimated 1RM so the chart is easier
      // to read.
      estimatedOneRepMax: Math.round(
        entry.estimatedOneRepMax
      ),

      weight: entry.weight,
      reps: entry.reps,
    })
  );

  // ----------------------------------------------------------
  // Not Enough Data
  // ----------------------------------------------------------

  // One workout gives us a data point, but we need at least
  // two workouts before a progression line is meaningful.
  if (chartData.length < 2) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl bg-slate-50 px-6 text-center">
        <div>
          <p className="font-semibold text-slate-700">
            Not enough data yet
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Complete this exercise in another workout to
            begin charting your progress.
          </p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------
  // Render Chart
  // ----------------------------------------------------------

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <LineChart
          data={chartData}
          margin={{
            top: 10,
            right: 10,
            left: -15,
            bottom: 0,
          }}
        >
          {/* Horizontal guide lines */}
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
          />

          {/* Workout dates */}
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            fontSize={12}
          />

          {/* Estimated 1RM */}
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={12}
            unit=" lb"
            domain={["auto", "auto"]}
          />

          {/* Tap / hover workout details */}
          <Tooltip
            formatter={(
              value,
              name,
              props
            ) => {
              if (
                name ===
                "Estimated 1RM"
              ) {
                return [
                  `${value} lb`,
                  "Estimated 1RM",
                ];
              }

              return [value, name];
            }}
            labelFormatter={(label) =>
              `Workout: ${label}`
            }
          />

          {/* Strength progression */}
          <Line
            type="monotone"
            dataKey="estimatedOneRepMax"
            name="Estimated 1RM"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{
              r: 4,
              fill: "#2563eb",
            }}
            activeDot={{
              r: 6,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}