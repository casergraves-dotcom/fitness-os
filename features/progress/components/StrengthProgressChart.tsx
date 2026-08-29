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
import type { TooltipContentProps } from "recharts";

import type {
  ExerciseProgressEntry,
} from "../hooks/useExerciseProgress";

// ============================================================
// Props
// ============================================================

interface StrengthProgressChartProps {
  progress: ExerciseProgressEntry[];
  hasHistoricalData?: boolean;
}

// ============================================================
// Helpers
// ============================================================

function getDateTimestamp(date: string) {
  const timestamp = /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? new Date(`${date}T12:00:00`).getTime()
    : new Date(date).getTime();

  return timestamp;
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  ).format(new Date(timestamp));
}

interface StrengthChartPoint {
  timestamp: number;
  estimatedOneRepMax: number;
  weight: number;
  reps: number;
}

function StrengthProgressTooltip({
  active,
  payload,
}: TooltipContentProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload as StrengthChartPoint;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {formatDate(point.timestamp)}
      </p>
      <p className="mt-2 font-semibold text-slate-900">
        {point.weight} lb × {point.reps} reps
      </p>
      <p className="mt-1 text-sm text-blue-600">
        Estimated 1RM: {point.estimatedOneRepMax} lb
      </p>
    </div>
  );
}

// ============================================================
// Strength Progress Chart
// ============================================================

export default function StrengthProgressChart({
  progress,
  hasHistoricalData = false,
}: StrengthProgressChartProps) {
  // ----------------------------------------------------------
  // Chart Data
  // ----------------------------------------------------------

  const chartData = progress.map(
    (entry) => ({
      timestamp: getDateTimestamp(entry.date),

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
            {hasHistoricalData
              ? "Choose a longer display range to see your strength trend."
              : "Complete this exercise in another workout to begin charting your progress."}
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
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tickFormatter={(timestamp) =>
              formatDate(timestamp)
            }
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
          <Tooltip content={StrengthProgressTooltip} />

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
