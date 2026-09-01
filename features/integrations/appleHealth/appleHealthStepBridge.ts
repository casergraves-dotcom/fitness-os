import type {
  AppleHealthDailyStepTotal,
} from "../../dailyActivity/utils/mergeAppleHealthStepTotals.ts";

export type AppleHealthAvailability =
  | "Available"
  | "Unavailable";

export interface AppleHealthStepAccessState {
  availability: AppleHealthAvailability;
  authorizationRequested: boolean;
  earliestAuthorizedDate?: string;
}

// Implemented by the future Swift/Capacitor plugin. A browser implementation
// must report Unavailable rather than pretending it can access Apple Health.
export interface AppleHealthStepBridge {
  getAccessState(): Promise<AppleHealthStepAccessState>;
  requestReadAuthorization(): Promise<AppleHealthStepAccessState>;
  readDailyStepTotals(input: {
    startDate: string;
    endDate: string;
  }): Promise<AppleHealthDailyStepTotal[]>;
}
