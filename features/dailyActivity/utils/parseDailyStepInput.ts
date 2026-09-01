export type DailyStepInputResult =
  | { status: "empty" }
  | { status: "invalid" }
  | { status: "valid"; steps: number };

export function parseDailyStepInput(
  value: string
): DailyStepInputResult {
  const trimmed = value.trim();

  if (trimmed === "") {
    return { status: "empty" };
  }

  if (!/^\d+$/.test(trimmed)) {
    return { status: "invalid" };
  }

  const steps = Number(trimmed);

  if (!Number.isSafeInteger(steps)) {
    return { status: "invalid" };
  }

  return {
    status: "valid",
    steps,
  };
}
