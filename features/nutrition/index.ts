// ============================================================
// Components
// ============================================================

export {
  default as NutritionTargets,
} from "./components/NutritionTargets";

export {
  default as DailyNutritionCard,
} from "./components/DailyNutritionCard";

export {
  default as MetabolicRateRecords,
} from "./components/MetabolicRateRecords";

// ============================================================
// Hooks
// ============================================================

export {
  useNutritionTargets,
} from "./hooks/useNutritionTargets";

export type {
  NutritionTargetInput,
} from "./hooks/useNutritionTargets";

export {
  useDailyNutrition,
} from "./hooks/useDailyNutrition";

export type {
  DailyNutritionInput,
} from "./hooks/useDailyNutrition";

export {
  useNutritionAdherence,
} from "./hooks/useNutritionAdherence";

export {
  useWeeklyNutritionAdherence,
} from "./hooks/useWeeklyNutritionAdherence";

export {
  useMetabolicRateRecords,
} from "./hooks/useMetabolicRateRecords";

export type {
  MetabolicRateRecordInput,
} from "./hooks/useMetabolicRateRecords";


// ============================================================
// Types
// ============================================================

export type {
  DailyNutritionRecord,
  MetabolicRateRecord,
  MetabolicRateSource,
  NutritionTarget,
} from "./nutritionTypes";


// ============================================================
// Utils
// ============================================================

export {
  getNutritionAdherence,
} from "./utils/getNutritionAdherence";

export type {
  CalorieAdherenceStatus,
  NutritionAdherence,
  ProteinAdherenceStatus,
} from "./utils/getNutritionAdherence";

export {
  getWeeklyNutritionAdherence,
} from "./utils/getWeeklyNutritionAdherence";

export type {
  WeeklyNutritionAdherence,
} from "./utils/getWeeklyNutritionAdherence";
