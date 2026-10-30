import AppShell from "@/components/layout/AppShell";
import WorkoutPreferencesForm from "@/features/workout/components/WorkoutPreferencesForm";

export default function WorkoutPreferencesPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Settings
          </p>
          <h1 className="mt-1 text-2xl font-bold">Workout Preferences</h1>
          <p className="mt-1 text-sm text-slate-500">
            Configure guided workout behavior without changing your templates.
          </p>
        </div>
        <WorkoutPreferencesForm />
      </div>
    </AppShell>
  );
}
