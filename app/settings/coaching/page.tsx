import AppShell from "@/components/layout/AppShell";
import CoachingPreferencesForm from "@/features/coach/components/CoachingPreferencesForm";

export default function CoachingPreferencesPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Settings</p>
          <h1 className="mt-1 text-2xl font-bold">Coaching Preferences</h1>
          <p className="mt-1 text-sm text-slate-500">Choose how Fitness OS should rank discretionary coaching options.</p>
        </div>
        <CoachingPreferencesForm />
      </div>
    </AppShell>
  );
}
