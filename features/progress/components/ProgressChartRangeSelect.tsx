import {
  PROGRESS_CHART_RANGE_OPTIONS,
} from "../utils/progressChartRange";

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

      <select
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
        className="mt-2 block rounded-xl border border-slate-300 bg-white px-3 py-2"
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
      </select>

    </label>
  );
}
