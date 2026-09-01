import {
  PROGRESS_CHART_RANGE_OPTIONS,
} from "../utils/progressChartRange";

import { Select } from "@/components/ui/select";

import type {
  ProgressChartRange,
} from "../utils/progressChartRange";


export default function ProgressChartRangeSelect({
  value,
  onChange,
}: {
  value: ProgressChartRange;
  onChange: (value: ProgressChartRange) => void;
}) {
  return (
    <label className="text-sm font-semibold text-slate-700">
      Display Range

      <Select
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value as ProgressChartRange
          )
        }
        className="mt-2 min-w-32"
      >
        {PROGRESS_CHART_RANGE_OPTIONS.map(
          (
            option
          ) => (
            <option
              key={
                option.value
              }
              value={
                option.value
              }
            >
              {option.label}
            </option>
          )
        )}
      </Select>

    </label>
  );
}
