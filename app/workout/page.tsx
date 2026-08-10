import {
  Suspense,
} from "react";

import {
  WorkoutScreen,
} from "@/features/workout";

// ============================================================
// Workout Page
// ============================================================

export default function WorkoutPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-slate-500">
          Loading workout...
        </div>
      }
    >
      <WorkoutScreen />
    </Suspense>
  );
}