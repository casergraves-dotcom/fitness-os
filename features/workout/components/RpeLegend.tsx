"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui";

import {
  getRpeDescription,
  getRpeScaleEntry,
} from "../rpe";

import type {
  RpeContext,
  RpeValue,
} from "../rpe";


// ============================================================
// Types
// ============================================================

interface RpeLegendProps {
  context:
    RpeContext;

  className?:
    string;
}


// ============================================================
// Constants
// ============================================================

const STRENGTH_LEGEND_VALUES:
  RpeValue[] = [
    10,
    9,
    8,
    7,
  ];


const CARDIO_LEGEND_VALUES:
  RpeValue[] = [
    10,
    9,
    8,
    7,
    5,
    3,
    1,
  ];


// ============================================================
// RPE Legend
// ============================================================

export default function RpeLegend({
  context,
  className =
    "",
}: RpeLegendProps) {
  const values =
    context ===
      "StrengthSet"
      ? STRENGTH_LEGEND_VALUES
      : CARDIO_LEGEND_VALUES;

  const description =
    context ===
      "StrengthSet"
      ? "Rate the effort of a completed set. Higher values mean fewer repetitions remained."
      : "Rate how hard the entire session felt, not just its hardest moment.";

  return (
    <Sheet>

      <SheetTrigger
        render={
          <button
            type="button"
            aria-label="Open RPE explanation"
            className={
              `inline-flex items-center rounded-full border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-600 transition hover:border-blue-400 hover:text-blue-700 ${className}`
            }
          />
        }
      >
        RPE ?
      </SheetTrigger>

      <SheetContent
        side="bottom"
        className="max-h-[85vh] overflow-y-auto rounded-t-2xl"
      >

        <SheetHeader className="border-b border-slate-200 pr-14">

          <SheetTitle>
            Rate of Perceived Exertion
          </SheetTitle>

          <SheetDescription>
            {description}
          </SheetDescription>

        </SheetHeader>

        <div className="space-y-3 px-4 pb-6">

          {values.map(
            (
              value
            ) => {
              const entry =
                getRpeScaleEntry(
                  value
                );

              const valueDescription =
                getRpeDescription(
                  value,
                  context
                );

              if (
                !entry ||
                !valueDescription
              ) {
                return null;
              }

              return (
                <div
                  key={
                    value
                  }
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                >

                  <div className="flex items-baseline justify-between gap-3">

                    <p className="font-semibold text-slate-900">
                      RPE {value}
                    </p>

                    <p className="text-xs font-medium text-slate-500">
                      {entry.effortLabel}
                    </p>

                  </div>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {valueDescription}
                  </p>

                </div>
              );
            }
          )}

        </div>

      </SheetContent>

    </Sheet>
  );
}