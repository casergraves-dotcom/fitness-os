"use client";

import { useEffect, useState } from "react";

import {
  PageHeader,
  SectionCard,
} from "@/components/ui";

import RestTimer from "./RestTimer";

interface WorkoutHeaderProps {
  workoutType: string;
  variantLabel?: string;
  startedAt: string;
  restStartedAt?: string;
  completedSets: number;
  totalSets: number;
}

export default function WorkoutHeader({
  workoutType,
  variantLabel,
  startedAt,
  restStartedAt,
  completedSets,
  totalSets,
}: WorkoutHeaderProps) {
  const [elapsed, setElapsed] = useState("00:00");

  useEffect(() => {
    const updateElapsed = () => {
      const start = new Date(startedAt).getTime();
      const now = Date.now();

      const seconds = Math.floor((now - start) / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;

      setElapsed(
        `${String(minutes).padStart(2, "0")}:${String(
          remainingSeconds
        ).padStart(2, "0")}`
      );
    };

    updateElapsed();

    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  const percent =
    totalSets === 0 ? 0 : (completedSets / totalSets) * 100;

  return (
    <SectionCard>
      <div className="flex items-center justify-between">
        <div>
          <PageHeader
            title={
              variantLabel
                ? variantLabel.replace(
                    " - ",
                    " · "
                  )
                : `${workoutType} Workout`
            }
          />

          {variantLabel && (
            <p className="mt-1 text-sm text-slate-500">
              Alternative workout for{" "}
              {workoutType}
            </p>
          )}
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-500">
            Elapsed
          </p>

          <p className="font-mono text-xl font-bold">
            {elapsed}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex justify-between text-sm">
          <span>
            {completedSets}/{totalSets} Sets
          </span>

          <span>{Math.round(percent)}%</span>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{
              width: `${percent}%`,
            }}
          />
        </div>
      </div>

      <RestTimer startedAt={restStartedAt} />
    </SectionCard>
  );
}