"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import RatingSelector from "@/components/ui/RatingSelector";
import { Button } from "@/components/ui/button";

import {
  Card,
} from "@/components/ui/card";

import {
  calculateReadiness,
} from "../utils/readiness";


// ============================================================
// Types
// ============================================================

export interface MorningCheckInRatings {
  Energy: number;
  Sleep: number;
  Mood: number;
  Stress: number;
  UpperBodySoreness: number;
  LowerBodySoreness: number;
}


interface MorningCheckInProps {
  ratings:
    MorningCheckInRatings;

  onChange:
    (
      ratings:
        MorningCheckInRatings
    ) => void;

  loaded?: boolean;
  compactWhenComplete?: boolean;
}


// ============================================================
// Morning Check-In
// ============================================================

export default function MorningCheckIn({
  ratings,
  onChange,
  loaded = true,
  compactWhenComplete = false,
}: MorningCheckInProps) {

  const [detailsOpen, setDetailsOpen] = useState(true);
  const initialDisplaySet = useRef(false);

  // ----------------------------------------------------------
  // Readiness
  // ----------------------------------------------------------

  const readiness =
    calculateReadiness(
      ratings
    );

  useEffect(() => {
    if (!loaded || initialDisplaySet.current) {
      return;
    }

    setDetailsOpen(!readiness);
    initialDisplaySet.current = true;
  }, [loaded, readiness]);


  // ----------------------------------------------------------
  // Readiness Status Styling
  // ----------------------------------------------------------

  const readinessStatusClass =
    readiness?.status === "high"
      ? "text-green-600"
      : readiness?.status === "normal"
        ? "text-blue-600"
        : readiness?.status === "low"
          ? "text-amber-600"
          : readiness?.status === "very-low"
            ? "text-red-600"
            : "text-slate-500";

  if (
    compactWhenComplete &&
    readiness &&
    !detailsOpen
  ) {
    return (
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Readiness
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              {readiness.label}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Morning check-in complete
            </p>
          </div>

          <div className="flex items-center gap-4">
            <p className="text-right text-2xl font-bold text-slate-900">
              {readiness.score.toFixed(1)}
              <span className="ml-1 text-sm font-medium text-slate-500">/ 5</span>
            </p>
            <Button
              type="button"
              onClick={() => setDetailsOpen(true)}
              variant="outline"
            >
              Edit
            </Button>
          </div>
        </div>
      </Card>
    );
  }


  return (
    <Card>

      {/* ====================================================
          Header
      ===================================================== */}

      <div className="flex items-start justify-between gap-6 px-6 pt-5">

        <div>

          <h2 className="text-xl font-bold">
            Morning Check-In
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            How are you feeling today?
          </p>

        </div>


        {/* ==================================================
            Readiness Result
        =================================================== */}

        {readiness && (
          <div className="shrink-0 text-right">

            <p className="text-2xl font-bold">
              {readiness.score.toFixed(
                1
              )}

              <span className="ml-1 text-sm font-medium text-slate-500">
                / 5
              </span>
            </p>

            <p
              className={`mt-1 text-sm font-semibold ${readinessStatusClass}`}
            >
              {readiness.label}
            </p>

          </div>
        )}

      </div>


      {/* ====================================================
          Column Headers
      ===================================================== */}

      <div className="mt-6 hidden grid-cols-2 gap-x-12 px-6 md:grid">

        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
          Readiness
        </p>

        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
          Recovery
        </p>

      </div>


      {/* ====================================================
          Ratings Grid
      ===================================================== */}

      <div className="mt-4 grid gap-x-12 gap-y-6 px-6 md:grid-cols-2">

        {/* --------------------------------------------------
            Row 1 — Energy / Stress
        --------------------------------------------------- */}

        <div>

          <p className="mb-2 font-medium">
            Energy
          </p>

          <RatingSelector
            value={
              ratings.Energy
            }
            onChange={
              (value) =>
                onChange({
                  ...ratings,

                  Energy:
                    value,
                })
            }
          />

        </div>


        <div>

          <p className="mb-2 font-medium">
            Stress
          </p>

          <RatingSelector
            value={
              ratings.Stress
            }
            onChange={
              (value) =>
                onChange({
                  ...ratings,

                  Stress:
                    value,
                })
            }
          />

        </div>


        {/* --------------------------------------------------
            Row 2 — Sleep / Upper Body
        --------------------------------------------------- */}

        <div>

          <p className="mb-2 font-medium">
            Sleep
          </p>

          <RatingSelector
            value={
              ratings.Sleep
            }
            onChange={
              (value) =>
                onChange({
                  ...ratings,

                  Sleep:
                    value,
                })
            }
          />

        </div>


        <div>

          <p className="mb-2 font-medium">
            Upper Body Soreness
          </p>

          <RatingSelector
            value={
              ratings.UpperBodySoreness
            }
            onChange={
              (value) =>
                onChange({
                  ...ratings,

                  UpperBodySoreness:
                    value,
                })
            }
          />

        </div>


        {/* --------------------------------------------------
            Row 3 — Mood / Lower Body
        --------------------------------------------------- */}

        <div>

          <p className="mb-2 font-medium">
            Mood
          </p>

          <RatingSelector
            value={
              ratings.Mood
            }
            onChange={
              (value) =>
                onChange({
                  ...ratings,

                  Mood:
                    value,
                })
            }
          />

        </div>


        <div>

          <p className="mb-2 font-medium">
            Lower Body Soreness
          </p>

          <RatingSelector
            value={
              ratings.LowerBodySoreness
            }
            onChange={
              (value) =>
                onChange({
                  ...ratings,

                  LowerBodySoreness:
                    value,
                })
            }
          />

        </div>

      </div>


      {/* ====================================================
          Scale Help
      ===================================================== */}

      <div className="mt-6 border-t px-6 pb-5 pt-4">

        <div className="grid gap-1 text-xs text-slate-500 md:grid-cols-2 md:gap-x-12">

          <p>
            Readiness: 1 = low · 5 = excellent
          </p>

          <p>
            Stress & soreness: 1 = low · 5 = high
          </p>

        </div>

      </div>

    </Card>
  );
}
