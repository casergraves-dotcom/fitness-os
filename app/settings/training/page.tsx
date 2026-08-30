import AppShell from "@/components/layout/AppShell";
import TrainingParticipationPreferences from "@/features/workout/components/TrainingParticipationPreferences";

export default function TrainingPreferencesPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Settings</p>
          <h1 className="mt-1 text-2xl font-bold">Training Preferences</h1>
          <p className="mt-1 text-sm text-slate-500">Choose which training activities apply to you.</p>
        </div>
        <TrainingParticipationPreferences />
      </div>
    </AppShell>
  );
}
