import AppShell from "@/components/layout/AppShell";
import ProgressDashboard from "@/features/progress/components/ProgressDashboard";

export default function ProgressPage() {
  return (
    <AppShell>

      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Progress
          </p>

          <h1 className="mt-1 text-2xl font-bold">
            Training Progress
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track your performance and recovery over time.
          </p>
        </div>


        <ProgressDashboard />
      </div>

    </AppShell>
  );
}
