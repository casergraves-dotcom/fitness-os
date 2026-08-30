// ============================================================
// Step Targets
// ============================================================

export interface StepTarget {
  id: string;

  effectiveDate: string;

  dailyStepTarget: number;

  notes?: string;

  createdAt: string;

  updatedAt: string;
}


// ============================================================
// Daily Steps
// ============================================================
//
// Source is explicit now so future health-platform imports can
// enter the same canonical daily-activity domain while retaining
// provenance.
// ============================================================

export type DailyStepSource =
  "Manual";


export interface DailyStepRecord {
  id: string;

  date: string;

  steps: number;

  source: DailyStepSource;

  notes?: string;

  confirmedAt?: string;

  createdAt: string;

  updatedAt: string;
}
