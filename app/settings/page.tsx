// ============================================================
// Imports
// ============================================================

import Link from "next/link";

import {
  Dumbbell,
  Library,
  ChevronRight,
  Target,
  SlidersHorizontal,
  MessageCircle,
} from "lucide-react";

import AppShell from "@/components/layout/AppShell";

// ============================================================
// Settings Page
// ============================================================

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* --------------------------------------------------
            Page Header
        --------------------------------------------------- */}

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Fitness OS
          </p>

          <h1 className="mt-1 text-2xl font-bold">
            Settings
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your goals, targets, workouts, and exercise library.
          </p>
        </div>

        {/* --------------------------------------------------
            Goals and Targets
        --------------------------------------------------- */}

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-500">
            GOALS
          </p>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Link
              href="/settings/goals"
              className="flex items-center gap-3 px-4 py-4 transition hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Target size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">
                  Goals &amp; Targets
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Manage outcome, nutrition, and daily-activity targets.
                </p>
              </div>

              <ChevronRight
                size={20}
                className="shrink-0 text-slate-400"
              />
            </Link>
          </div>
        </div>

        {/* --------------------------------------------------
            Workout Settings
        --------------------------------------------------- */}

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-500">
            WORKOUTS
          </p>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <Link
              href="/settings/training"
              className="flex items-center gap-3 px-4 py-4 transition hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <SlidersHorizontal size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">Training Preferences</p>
                <p className="mt-1 text-sm text-slate-500">Choose the activities that belong in your plan.</p>
              </div>
              <ChevronRight size={20} className="shrink-0 text-slate-400" />
            </Link>

            <div className="ml-[68px] border-t border-slate-100" />

            <Link
              href="/settings/coaching"
              className="flex items-center gap-3 px-4 py-4 transition hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <MessageCircle size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">Coaching Preferences</p>
                <p className="mt-1 text-sm text-slate-500">Choose how discretionary coaching should lean.</p>
              </div>
              <ChevronRight size={20} className="shrink-0 text-slate-400" />
            </Link>

            <div className="ml-[68px] border-t border-slate-100" />

            {/* Edit Workouts */}

            <Link
              href="/settings/workouts"
              className="flex items-center gap-3 px-4 py-4 transition hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Dumbbell size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">
                  Edit Workouts
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Customize exercises, order, and sets.
                </p>
              </div>

              <ChevronRight
                size={20}
                className="shrink-0 text-slate-400"
              />
            </Link>

            {/* Divider */}

            <div className="ml-[68px] border-t border-slate-100" />

            {/* Exercise Library */}

            <Link
              href="/settings/exercises"
              className="flex items-center gap-3 px-4 py-4 transition hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Library size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">
                  Exercise Library
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Browse and manage your exercises.
                </p>
              </div>

              <ChevronRight
                size={20}
                className="shrink-0 text-slate-400"
              />
            </Link>
          </div>
        </div>

        {/* --------------------------------------------------
            Future Settings
        --------------------------------------------------- */}

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-500">
            APP
          </p>

          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5">
            <p className="text-sm font-medium text-slate-500">
              More settings coming later.
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Rest timers, units, workout preferences,
              and other options will live here.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
