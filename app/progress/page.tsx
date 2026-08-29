import AppShell from "@/components/layout/AppShell";

import {
  BodyMeasurements,
  DexaRecords,
  ExerciseProgress,
  RecoveryProgress,
  RunningProgress,
  WeeklyProgressCheckIn,
  BodyCompositionProgress,
  DailyActivityProgress,
  WeeklyReview,
  LongTermProgressReview,
  ProgressOutcomeSummary,
  TrainingAdherenceSummary,
} from "@/features/progress";

// ============================================================
// Progress Page
// ============================================================

export default function ProgressPage() {
  return (
    <AppShell>

      <div className="space-y-8">

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


        <section className="space-y-4">
          <WeeklyReview />
        </section>


        <section className="space-y-4">
          <LongTermProgressReview />
        </section>


        <section className="space-y-4">
          <ProgressOutcomeSummary />
        </section>


        <section className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Training
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Training Consistency
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review current completion and adherence across complete training weeks.
            </p>
          </div>

          <TrainingAdherenceSummary />
        </section>


        <section className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Daily Activity
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Activity Progress
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review recent step consistency, data coverage, and general-activity trends.
            </p>
          </div>

          <DailyActivityProgress />
        </section>


        <section className="space-y-4">

          <div>

            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Body Composition
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Progress Summary
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Review body-weight trends, progress rate, and projected goal timing.
            </p>

          </div>

          <BodyCompositionProgress />

        </section>


        <section className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Body Composition
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Weekly Progress Check-In
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Capture a weekly snapshot and compare it with your recent body-composition trend and active goal.
            </p>
          </div>

          <WeeklyProgressCheckIn />
        </section>


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


        <section className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Body Composition
            </p>

            <h2 className="mt-1 text-xl font-bold">
              DEXA Records
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Preserve DEXA scans as distinct body-composition assessments and compare changes between scans.
            </p>
          </div>

          <DexaRecords />
        </section>


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
