import { Card } from "@/components/ui/card";
import type { WeeklyProgress as WeeklyProgressType } from "../types";

interface WeeklyProgressProps {
  progress: WeeklyProgressType;
}

function ProgressRow({
  label,
  value,
  goal,
}: {
  label: string;
  value: number;
  goal: number;
}) {
  const percent = Math.min((value / goal) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-slate-500">
          {value}/{goal}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default function WeeklyProgress({
  progress,
}: WeeklyProgressProps) {
  return (
    <Card className="rounded-2xl p-6 shadow-sm">
      <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-blue-600">
        This Week
      </p>

      <div className="space-y-5">
        <ProgressRow
          label="Workouts"
          value={progress.workoutsCompleted}
          goal={progress.workoutGoal}
        />

        <ProgressRow
          label="Protein"
          value={progress.proteinDays}
          goal={progress.proteinGoal}
        />

        <ProgressRow
          label="Steps"
          value={progress.stepDays}
          goal={progress.stepGoal}
        />
      </div>
    </Card>
  );
}