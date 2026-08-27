// ============================================================
// Components
// ============================================================

export {
  default as StepTargets,
} from "./components/StepTargets";

export {
  default as DailyStepsCard,
} from "./components/DailyStepsCard";


// ============================================================
// Hooks
// ============================================================

export {
  useStepTargets,
} from "./hooks/useStepTargets";

export type {
  StepTargetInput,
} from "./hooks/useStepTargets";


export {
  useDailySteps,
} from "./hooks/useDailySteps";

export type {
  DailyStepInput,
} from "./hooks/useDailySteps";


export {
  useWeeklyStepAdherence,
} from "./hooks/useWeeklyStepAdherence";


// ============================================================
// Types
// ============================================================

export type {
  DailyStepRecord,
  DailyStepSource,
  StepTarget,
} from "./dailyActivityTypes";

export type {
  DailyStepAdherence,
  WeeklyStepAdherence,
} from "./utils/getWeeklyStepAdherence";