"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";

import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui";
import {
  kilogramsToPounds,
  poundsToKilograms,
  roundConvertedWeight,
} from "../utils/convertWeight";

interface WeightConverterProps {
  initialPounds: number;
  onApplyPounds: (pounds: number) => void;
}

function parseWeight(value: string) {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function display(value: number) {
  return String(roundConvertedWeight(value));
}

export default function WeightConverter({
  initialPounds,
  onApplyPounds,
}: WeightConverterProps) {
  const [open, setOpen] = useState(false);
  const [kilograms, setKilograms] = useState("");
  const [pounds, setPounds] = useState(initialPounds > 0 ? String(initialPounds) : "");

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setPounds(initialPounds > 0 ? String(initialPounds) : "");
      setKilograms(initialPounds > 0 ? display(poundsToKilograms(initialPounds)) : "");
    }
  }

  function updateKilograms(value: string) {
    setKilograms(value);
    const parsed = parseWeight(value);
    setPounds(parsed === null ? "" : display(kilogramsToPounds(parsed)));
  }

  function updatePounds(value: string) {
    setPounds(value);
    const parsed = parseWeight(value);
    setKilograms(parsed === null ? "" : display(poundsToKilograms(parsed)));
  }

  const applicablePounds = parseWeight(pounds);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        render={<button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700" />}
      >
        <Calculator size={14} /> Convert weight
      </SheetTrigger>

      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="border-b border-slate-200 pr-14">
          <SheetTitle>Weight Converter</SheetTitle>
          <SheetDescription>Convert either direction. Fitness OS records workout loads in pounds.</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-6">
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
            <label className="text-sm font-medium text-slate-700">
              Kilograms
              <div className="mt-1 flex items-center gap-2">
                <input type="number" inputMode="decimal" min="0" step="any" value={kilograms} onChange={(event) => updateKilograms(event.target.value)} className="min-w-0 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base" />
                <span className="text-slate-500">kg</span>
              </div>
            </label>

            <span className="pb-2 text-slate-400">≈</span>

            <label className="text-sm font-medium text-slate-700">
              Pounds
              <div className="mt-1 flex items-center gap-2">
                <input type="number" inputMode="decimal" min="0" step="any" value={pounds} onChange={(event) => updatePounds(event.target.value)} className="min-w-0 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-base" />
                <span className="text-slate-500">lb</span>
              </div>
            </label>
          </div>

          <p className="text-xs text-slate-500">Mathematical conversion only. Choose the available gym load yourself; Fitness OS will not round to an equipment increment.</p>

          <Button
            type="button"
            disabled={applicablePounds === null}
            className="w-full"
            onClick={() => {
              if (applicablePounds === null) return;
              onApplyPounds(applicablePounds);
              setOpen(false);
            }}
          >
            {applicablePounds === null ? "Enter a weight" : `Use ${applicablePounds} lb`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
