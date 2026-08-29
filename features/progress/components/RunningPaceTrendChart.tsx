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
import type { TooltipContentProps } from "recharts";

import type { RunSession } from "../../workout/types";

interface RunningPaceTrendChartProps {
  runs: RunSession[];
  hasHistoricalData?: boolean;
}

interface RunningPacePoint {
  timestamp: number;
  paceMinutesPerMile: number;
  distanceMiles: number;
  durationMinutes: number;
  rpe?: number;
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));
}

function formatPace(paceMinutesPerMile: number) {
  let minutes = Math.floor(paceMinutesPerMile);
  let seconds = Math.round((paceMinutesPerMile - minutes) * 60);

  if (seconds === 60) {
    minutes += 1;
    seconds = 0;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function RunningPaceTooltip({
  active,
  payload,
}: TooltipContentProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload as RunningPacePoint;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {formatDate(point.timestamp)}
      </p>
      <p className="mt-2 font-semibold text-slate-900">
        {point.distanceMiles.toFixed(2)} mi · {point.durationMinutes} min
      </p>
      <p className="mt-1 text-sm text-blue-600">
        Pace: {formatPace(point.paceMinutesPerMile)} / mi
      </p>
      {point.rpe !== undefined && (
        <p className="mt-1 text-xs text-slate-500">RPE {point.rpe}/10</p>
      )}
    </div>
  );
}

export default function RunningPaceTrendChart({
  runs,
  hasHistoricalData = false,
}: RunningPaceTrendChartProps) {
  const chartData: RunningPacePoint[] = runs
    .map((run) => ({
      timestamp: new Date(run.completedAt ?? run.startedAt).getTime(),
      paceMinutesPerMile: run.durationMinutes! / run.distanceMiles!,
      distanceMiles: run.distanceMiles!,
      durationMinutes: run.durationMinutes!,
      rpe: run.rpe,
    }))
    .sort((a, b) => a.timestamp - b.timestamp);

  if (chartData.length < 2) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl bg-slate-50 px-6 text-center">
        <div>
          <p className="font-semibold text-slate-700">Not enough data yet</p>
          <p className="mt-1 text-sm text-slate-500">
            {hasHistoricalData
              ? "Choose a longer display range to see your pace trend."
              : "Complete another run with duration and distance to begin charting your pace."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -5, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tickFormatter={(timestamp) => formatDate(Number(timestamp))}
          />
          <YAxis
            dataKey="paceMinutesPerMile"
            reversed
            tickLine={false}
            axisLine={false}
            fontSize={12}
            width={48}
            domain={["auto", "auto"]}
            tickFormatter={(pace) => formatPace(Number(pace))}
          />
          <Tooltip content={RunningPaceTooltip} />
          <Line
            type="monotone"
            dataKey="paceMinutesPerMile"
            name="Pace"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 4, fill: "#2563eb" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
