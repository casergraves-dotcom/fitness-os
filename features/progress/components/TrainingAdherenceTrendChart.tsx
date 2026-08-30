"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipContentProps } from "recharts";

import type { ProgressReviewAdherenceWeek } from "../utils/getProgressReviewAdherence";

function getDateTimestamp(date: string) {
  return new Date(`${date}T12:00:00`).getTime();
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));
}

interface AdherenceChartPoint {
  timestamp: number;
  adherencePercent: number;
  requiredCompleted: number;
  requiredScheduled: number;
  weekType: string;
}

function TrainingAdherenceTooltip({
  active,
  payload,
}: TooltipContentProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload as AdherenceChartPoint;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Week of {formatDate(point.timestamp)}
      </p>
      <p className="mt-2 font-semibold text-slate-900">
        {point.adherencePercent}% required training
      </p>
      <p className="mt-1 text-sm text-slate-600">
        {point.requiredCompleted}/{point.requiredScheduled} required activities completed
      </p>
      <p className="mt-1 text-xs text-slate-500">{point.weekType}</p>
    </div>
  );
}

export default function TrainingAdherenceTrendChart({
  weeks,
  hasHistoricalData = false,
}: {
  weeks: ProgressReviewAdherenceWeek[];
  hasHistoricalData?: boolean;
}) {
  const chartData: AdherenceChartPoint[] = weeks.map((week) => ({
    timestamp: getDateTimestamp(week.weekStartDate),
    adherencePercent: Math.round(week.adherenceRate * 100),
    requiredCompleted: week.requiredCompleted,
    requiredScheduled: week.requiredScheduled,
    weekType: week.weekType,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl bg-slate-50 px-6 text-center">
        <div>
          <p className="font-semibold text-slate-700">No complete weeks yet</p>
          <p className="mt-1 text-sm text-slate-500">
            {hasHistoricalData
              ? "Choose a longer display range to review complete training weeks."
              : "A week appears here only after the full Sunday–Saturday period can be evaluated."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
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
            domain={[0, 100]}
            tickLine={false}
            axisLine={false}
            fontSize={12}
            unit="%"
          />
          <Tooltip content={TrainingAdherenceTooltip} />
          <Bar
            dataKey="adherencePercent"
            name="Required training"
            fill="#2563eb"
            radius={[6, 6, 0, 0]}
            maxBarSize={44}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
