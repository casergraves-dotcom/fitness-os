// ============================================================
// Components
// ============================================================

export {
  default as NutritionTargets,
} from "./components/NutritionTargets";

export {
  default as DailyNutritionCard,
} from "./components/DailyNutritionCard";

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


// ============================================================
// Types
// ============================================================

export type {
  DailyNutritionRecord,
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