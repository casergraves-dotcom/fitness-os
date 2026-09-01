"use client";

import { useState } from "react";

import {
  BodyCompositionProgress,
  BodyMeasurements,
  DailyActivityProgress,
  DexaRecords,
  ExerciseProgress,
  LongTermProgressReview,
  ProgressOutcomeSummary,
  RecoveryProgress,
  RunningProgress,
  TrainingAdherenceSummary,
  WeeklyProgressCheckIn,
  WeeklyReview,
} from "@/features/progress";

type ProgressDomain =
  | "Overview"
  | "Body"
  | "Training"
  | "Activity"
  | "Strength"
  | "Cardio"
  | "Recovery";

const domains: ProgressDomain[] = [
  "Overview",
  "Body",
  "Training",
  "Activity",
  "Strength",
  "Cardio",
  "Recovery",
];

type BodyView = "Summary" | "Check-Ins" | "Measurements" | "DEXA";

const bodyViews: BodyView[] = ["Summary", "Check-Ins", "Measurements", "DEXA"];

function DomainHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

export default function ProgressDashboard() {
  const [domain, setDomain] = useState<ProgressDomain>("Overview");
  const [bodyView, setBodyView] = useState<BodyView>("Summary");

  return (
    <div className="space-y-6">
      <nav
        aria-label="Progress areas"
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
      >
        {domains.map((item) => {
          const selected = item === domain;

          return (
            <button
              key={item}
              type="button"
              aria-pressed={selected}
              onClick={() => setDomain(item)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                selected
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700"
              }`}
            >
              {item}
            </button>
          );
        })}
      </nav>

      {domain === "Overview" && (
        <div className="space-y-6">
          <WeeklyReview />
          <LongTermProgressReview />
          <ProgressOutcomeSummary />
        </div>
      )}

      {domain === "Body" && (
        <div className="space-y-6">
          <nav
            aria-label="Body composition views"
            className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1 sm:flex sm:w-fit"
          >
            {bodyViews.map((item) => {
              const selected = item === bodyView;

              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setBodyView(item)}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                    selected
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </nav>

          {bodyView === "Summary" && (
            <section className="space-y-4">
            <DomainHeader
              eyebrow="Body Composition"
              title="Progress Summary"
              description="Review body-weight trends, progress rate, and projected goal timing."
            />
            <BodyCompositionProgress />
            </section>
          )}

          {bodyView === "Check-Ins" && (
            <section className="space-y-4">
            <DomainHeader
              eyebrow="Body Composition"
              title="Weekly Progress Check-In"
              description="Capture a weekly snapshot and compare it with your recent body-composition trend and active goal."
            />
            <WeeklyProgressCheckIn />
            </section>
          )}

          {bodyView === "Measurements" && (
            <section className="space-y-4">
            <DomainHeader
              eyebrow="Body Composition"
              title="Body Measurements"
              description="Track weight, circumference measurements, and body-composition changes over time."
            />
            <BodyMeasurements />
            </section>
          )}

          {bodyView === "DEXA" && (
            <section className="space-y-4">
            <DomainHeader
              eyebrow="Body Composition"
              title="DEXA Records"
              description="Preserve DEXA scans as distinct body-composition assessments and compare changes between scans."
            />
            <DexaRecords />
            </section>
          )}
        </div>
      )}

      {domain === "Training" && (
        <section className="space-y-4">
          <DomainHeader
            eyebrow="Training"
            title="Training Consistency"
            description="Review current completion and adherence across complete training weeks."
          />
          <TrainingAdherenceSummary />
        </section>
      )}

      {domain === "Activity" && (
        <section className="space-y-4">
          <DomainHeader
            eyebrow="Daily Activity"
            title="Activity Progress"
            description="Review recent step consistency, data coverage, and general-activity trends."
          />
          <DailyActivityProgress />
        </section>
      )}

      {domain === "Strength" && (
        <section className="space-y-4">
          <DomainHeader
            eyebrow="Strength"
            title="Exercise Progress"
            description="Track estimated strength changes for individual exercises."
          />
          <ExerciseProgress />
        </section>
      )}

      {domain === "Cardio" && (
        <section className="space-y-4">
          <DomainHeader
            eyebrow="Running"
            title="Cardio Progress"
            description="Track running volume, pace, and recent performance."
          />
          <RunningProgress />
        </section>
      )}

      {domain === "Recovery" && (
        <section className="space-y-4">
          <DomainHeader
            eyebrow="Recovery"
            title="Readiness & Recovery"
            description="Track how sleep, energy, mood, stress, and soreness change over time."
          />
          <RecoveryProgress />
        </section>
      )}
    </div>
  );
}
