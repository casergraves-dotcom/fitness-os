"use client";

import {
  BodyWeightTrendChart,
  MeasurementTrendChart,
} from "@/features/progress";

import {
  useBodyCompositionGoalProgress,
} from "../hooks/useBodyCompositionGoalProgress";

import {
  useBodyCompositionGoals,
} from "../hooks/useBodyCompositionGoals";

import {
  useBodyCompositionTrends,
} from "../hooks/useBodyCompositionTrends";

import {
  useBodyMeasurements,
} from "../hooks/useBodyMeasurements";

import {
  useBodyCompositionMilestones,
} from "../hooks/useBodyCompositionMilestones";

import {
  default as ProgressPhotoTimeline,
} from "./ProgressPhotoTimeline";

import ProgressPhotoComparison from "./ProgressPhotoComparison";

import StrengthRetentionSummary from "./StrengthRetentionSummary";

import CardioProgressSummary from "./CardioProgressSummary";

import TrainingAdherenceSummary from "./TrainingAdherenceSummary";

import ProgressOutcomeSummary from "./ProgressOutcomeSummary";


function formatSignedRate(
  value:
    number |
    undefined
) {
  if (
    value ===
    undefined
  ) {
    return "Not enough data";
  }

  return `${value > 0 ? "+" : ""}${value} lb / week`;
}


export default function BodyCompositionProgress() {
  const {
    loaded,
    measurements,
  } =
    useBodyMeasurements();

  const {
    currentGoal,
  } =
    useBodyCompositionGoals();

  const {
    weightTrend,
  } =
    useBodyCompositionTrends(
      measurements
    );

  const goalProgress =
    useBodyCompositionGoalProgress(
      currentGoal,
      weightTrend
    );

  const milestones =
    useBodyCompositionMilestones(
        currentGoal,
        weightTrend
    );


  const waistData =
    measurements
      .filter(
        (
          measurement
        ) =>
          measurement.waistIn !==
          undefined
      )
      .map(
        (
          measurement
        ) => ({
          date:
            measurement.date,

          value:
            measurement.waistIn!,
        })
      )
      .sort(
        (
          a,
          b
        ) =>
          a.date.localeCompare(
            b.date
          )
      );


  const bodyFatData =
    measurements
      .filter(
        (
          measurement
        ) =>
          measurement.bodyFatPercent !==
          undefined
      )
      .map(
        (
          measurement
        ) => ({
          date:
            measurement.date,

          value:
            measurement.bodyFatPercent!,
        })
      )
      .sort(
        (
          a,
          b
        ) =>
          a.date.localeCompare(
            b.date
          )
      );


  const leanMassData =
    measurements
      .filter(
        (
          measurement
        ) =>
          measurement.leanMassLb !==
          undefined
      )
      .map(
        (
          measurement
        ) => ({
          date:
            measurement.date,

          value:
            measurement.leanMassLb!,
        })
      )
      .sort(
        (
          a,
          b
        ) =>
          a.date.localeCompare(
            b.date
          )
      );


  if (
    !loaded
  ) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <p className="text-sm text-slate-500">
          Loading body-composition progress...
        </p>

      </div>
    );
  }


  return (
    <div className="space-y-4">

      <div className="rounded-2xl border bg-white p-5 shadow-sm">

        <div className="flex flex-wrap items-start justify-between gap-4">

          <div>

            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Body Weight
            </p>

            <h3 className="mt-1 text-lg font-bold text-slate-900">
              Weight Trend
            </h3>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Raw weigh-ins are shown separately from the calculated
              seven-day rolling trend.
            </p>

          </div>


          <div className="text-right">

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Expected Rate
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-900">
              {
                formatSignedRate(
                  goalProgress
                    .expectedWeeklyWeightChangeLb
                )
              }
            </p>

          </div>

        </div>


        <div className="mt-5">

          <BodyWeightTrendChart
            trend={
              weightTrend
            }
          />

        </div>

      </div>


      <div className="grid gap-4 xl:grid-cols-2">

        <TrendCard
          title="Waist Trend"
          description="Recorded waist measurements over time."
        >
          <MeasurementTrendChart
            data={
              waistData
            }
            unit="in"
            label="Waist"
            emptyMessage="Add at least two waist measurements to begin charting your trend."
          />
        </TrendCard>


        <TrendCard
          title="Body-Fat Trend"
          description="Recorded body-fat measurements over time."
        >
          <MeasurementTrendChart
            data={
              bodyFatData
            }
            unit="%"
            label="Body Fat"
            emptyMessage="Add at least two body-fat measurements to begin charting your trend."
          />
        </TrendCard>


        <TrendCard
          title="Lean-Mass Trend"
          description="Recorded lean-mass measurements over time."
        >
          <MeasurementTrendChart
            data={
              leanMassData
            }
            unit="lb"
            label="Lean Mass"
            emptyMessage="Add at least two lean-mass measurements to begin charting your trend."
          />
        </TrendCard>

      </div>


      {milestones.length > 0 && (
        <div className="rounded-2xl border bg-white p-5 shadow-sm">

            <h3 className="text-lg font-bold text-slate-900">
            Progress Milestones
            </h3>

            <p className="mt-1 text-sm text-slate-500">
            Meaningful checkpoints along the path toward your current goal.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">

            {milestones.map(
                (
                milestone
                ) => (
                <div
                    key={
                    milestone.id
                    }
                    className="rounded-xl bg-slate-50 p-4"
                >

                    <div className="flex items-start justify-between gap-3">

                    <div>

                        <p className="font-semibold text-slate-900">
                        {milestone.label}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                        {milestone.targetWeightLb} lb
                        </p>

                    </div>

                    <span className="text-sm font-semibold text-slate-600">
                        {
                        milestone.achieved
                            ? "Reached"
                            : "Upcoming"
                        }
                    </span>

                    </div>

                    {
                    milestone.achievedDate &&
                    (
                        <p className="mt-3 text-xs text-slate-500">
                        Reached {milestone.achievedDate}
                        </p>
                    )
                    }

                </div>
                )
            )}

            </div>

        </div>
        )}

        <StrengthRetentionSummary />

        <CardioProgressSummary />

        <TrainingAdherenceSummary />

        <ProgressOutcomeSummary />
        
        <ProgressPhotoTimeline />

        <ProgressPhotoComparison />

    </div>
  );
}


function TrendCard({
  title,
  description,
  children,
}: {
  title:
    string;

  description:
    string;

  children:
    React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">

      <h3 className="text-lg font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>

      <div className="mt-5">
        {children}
      </div>

    </div>
  );
}