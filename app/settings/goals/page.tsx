import AppShell from "@/components/layout/AppShell";

import {
  StepTargets,
} from "@/features/dailyActivity";

import {
  NutritionTargets,
} from "@/features/nutrition";

import {
  GoalProfile,
} from "@/features/progress";


// ============================================================
// Goals and Targets Settings
// ============================================================

export default function GoalsSettingsPage() {
  return (
    <AppShell>

      <div className="space-y-8">

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Settings
          </p>

          <h1 className="mt-1 text-2xl font-bold">
            Goals &amp; Targets
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Define what Fitness OS should use when evaluating your progress.
          </p>
        </div>


        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold">
              Outcome Goal
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Set your body-composition or performance goal and expected rate of change.
            </p>
          </div>

          <GoalProfile />
        </section>


        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold">
              Nutrition Targets
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Set calorie and protein targets used to evaluate nutrition adherence.
            </p>
          </div>

          <NutritionTargets />
        </section>


        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold">
              Daily Activity Target
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Set the daily step target used to evaluate general activity.
            </p>
          </div>

          <StepTargets />
        </section>

      </div>

    </AppShell>
  );
}
