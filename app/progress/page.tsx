import AppShell from "@/components/layout/AppShell";

import {
  BodyMeasurements,
  ExerciseProgress,
  GoalProfile,
  RecoveryProgress,
  RunningProgress,
} from "@/features/progress";


// ============================================================
// Progress Page
// ============================================================

export default function ProgressPage() {
  return (
    <AppShell>

      <div className="space-y-8">

        {/* ====================================================
            Page Header
        ===================================================== */}

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


        {/* ====================================================
            Goal
        ===================================================== */}

        <section className="space-y-4">

          <div>

            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Outcome
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Goal Profile
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Define the outcome Fitness OS should use when evaluating progress.
            </p>

          </div>


          <GoalProfile />

        </section>


        {/* ====================================================
            Body Composition
        ===================================================== */}

        <section className="space-y-4">

          <div>

            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Body Composition
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Body Measurements
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Track weight, circumference measurements, and body-composition changes over time.
            </p>

          </div>


          <BodyMeasurements />

        </section>


        {/* ====================================================
            Strength
        ===================================================== */}

        <section className="space-y-4">

          <div>

            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Strength
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Exercise Progress
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Track estimated strength changes for individual exercises.
            </p>

          </div>


          <ExerciseProgress />

        </section>


        {/* ====================================================
            Running
        ===================================================== */}

        <section className="space-y-4">

          <div>

            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Running
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Cardio Progress
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Track running volume, pace, and recent performance.
            </p>

          </div>


          <RunningProgress />

        </section>


        {/* ====================================================
            Recovery
        ===================================================== */}

        <section className="space-y-4">

          <div>

            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Recovery
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Readiness & Recovery
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Track how sleep, energy, mood, stress, and soreness change over time.
            </p>

          </div>


          <RecoveryProgress />

        </section>

      </div>

    </AppShell>
  );
}