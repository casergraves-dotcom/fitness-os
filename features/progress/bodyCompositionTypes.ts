// ============================================================
// Body Composition Goals
// ============================================================

export type BodyCompositionGoalType =
  | "FatLoss"
  | "BodyComposition"
  | "Maintenance"
  | "Performance";


export interface BodyCompositionGoal {
  id: string;

  effectiveDate: string;

  primaryGoal:
    BodyCompositionGoalType;

  targetWeightLb?: number;

  targetBodyFatPercent?: number;

  expectedWeeklyWeightChangeLb?: number;

  performanceGoals?: string[];

  notes?: string;

  createdAt: string;

  updatedAt: string;
}


// ============================================================
// Body Measurements
// ============================================================

export type BodyMeasurementSource =
  | "Manual"
  | "HomeScale"
  | "DEXA";


export interface BodyMeasurement {
  id: string;

  date: string;

  source:
    BodyMeasurementSource;

  // Scale / body composition
  weightLb?: number;
  bodyFatPercent?: number;
  leanMassLb?: number;
  fatMassLb?: number;

  // Circumference measurements
  neckIn?: number;
  chestIn?: number;
  shouldersIn?: number;
  abdomenIn?: number;
  waistIn?: number;
  hipsIn?: number;

  leftUpperArmIn?: number;
  rightUpperArmIn?: number;

  leftThighIn?: number;
  rightThighIn?: number;

  leftCalfIn?: number;
  rightCalfIn?: number;

  notes?: string;

  createdAt: string;
  updatedAt: string;

  dexaRecordId?: string;
}


// ============================================================
// DEXA Records
// ============================================================

export interface DexaReportFile {
  storagePath: string;

  fileName: string;

  contentType: string;
}


export interface DexaRecord {
  id: string;

  scanDate: string;

  weightLb?: number;

  bodyFatPercent?: number;

  fatMassLb?: number;

  leanMassLb?: number;

  notes?: string;

  reportFile?: DexaReportFile;

  createdAt: string;

  updatedAt: string;
}


// ============================================================
// Progress Photos
// ============================================================

export type ProgressPhotoView =
  | "Front"
  | "Side"
  | "Back";


export interface ProgressPhotoReference {
  id: string;

  view:
    ProgressPhotoView;

  storagePath: string;

  fileName: string;

  contentType: string;

  uploadedAt: string;
}


// ============================================================
// Weekly Progress Check-Ins
// ============================================================

export interface ProgressCheckIn {
  id: string;

  date: string;

  // References the BodyMeasurement recorded with this check-in.
  measurementId?: string;

  photos?: ProgressPhotoReference[];

  notes?: string;

  createdAt: string;

  updatedAt: string;
}