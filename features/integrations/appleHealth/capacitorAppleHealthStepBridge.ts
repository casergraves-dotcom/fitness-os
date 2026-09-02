import {
  Capacitor,
  registerPlugin,
} from "@capacitor/core";
import type {
  AppleHealthDailyStepTotal,
} from "../../dailyActivity/utils/mergeAppleHealthStepTotals.ts";
import type {
  AppleHealthStepAccessState,
  AppleHealthStepBridge,
} from "./appleHealthStepBridge.ts";

interface NativeAppleHealthStepsPlugin {
  getAccessState(): Promise<AppleHealthStepAccessState>;
  requestReadAuthorization(): Promise<AppleHealthStepAccessState>;
  readDailyStepTotals(input: {
    startDate: string;
    endDate: string;
  }): Promise<{ totals: AppleHealthDailyStepTotal[] }>;
}

interface CapacitorRuntime {
  getPlatform(): string;
  isNativePlatform(): boolean;
  isPluginAvailable(name: string): boolean;
}

const nativePlugin =
  registerPlugin<NativeAppleHealthStepsPlugin>("AppleHealthSteps");

const unavailableState: AppleHealthStepAccessState = {
  availability: "Unavailable",
  authorizationRequested: false,
};

// The same application runs as a PWA and inside the future iOS container.
// Browser calls resolve safely as unavailable; only an iOS native runtime with
// the project-owned Swift plugin can invoke HealthKit.
export function createCapacitorAppleHealthStepBridge(
  runtime: CapacitorRuntime = Capacitor,
  plugin: NativeAppleHealthStepsPlugin = nativePlugin
): AppleHealthStepBridge {
  const canUseNativePlugin = () =>
    runtime.isNativePlatform() &&
    runtime.getPlatform() === "ios" &&
    runtime.isPluginAvailable("AppleHealthSteps");

  return {
    async getAccessState() {
      if (!canUseNativePlugin()) return unavailableState;
      return plugin.getAccessState();
    },

    async requestReadAuthorization() {
      if (!canUseNativePlugin()) return unavailableState;
      return plugin.requestReadAuthorization();
    },

    async readDailyStepTotals(input) {
      if (!canUseNativePlugin()) return [];
      const result = await plugin.readDailyStepTotals(input);
      return result.totals;
    },
  };
}
