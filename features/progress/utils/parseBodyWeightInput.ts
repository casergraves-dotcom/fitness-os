export type BodyWeightInputResult =
  | { status: "empty" }
  | { status: "invalid" }
  | { status: "valid"; weightLb: number };

export function parseBodyWeightInput(
  value: string
): BodyWeightInputResult {
  const trimmed = value.trim();

  if (trimmed === "") {
    return { status: "empty" };
  }

  if (!/^\d+(?:\.\d+)?$/.test(trimmed)) {
    return { status: "invalid" };
  }

  const weightLb = Number(trimmed);

  if (!Number.isFinite(weightLb) || weightLb <= 0) {
    return { status: "invalid" };
  }

  return {
    status: "valid",
    weightLb,
  };
}
