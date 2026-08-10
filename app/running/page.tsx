import {
  Suspense,
} from "react";

import {
  RunScreen,
} from "@/features/running";

// ============================================================
// Running Page
// ============================================================

export default function RunningPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-slate-500">
          Loading running...
        </div>
      }
    >
      <RunScreen />
    </Suspense>
  );
}