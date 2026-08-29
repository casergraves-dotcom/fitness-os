export type NutritionCalculatorSex = "Male" | "Female";

export type NutritionActivityLevel =
  | "Sedentary"
  | "Light"
  | "Moderate"
  | "VeryActive"
  | "ExtraActive";

export type NutritionGoalDirection = "Lose" | "Maintain" | "Gain";

export interface NutritionTargetRecommendationInput {
  sex: NutritionCalculatorSex;
  ageYears: number;
  heightInches: number;
  weightLb: number;
  activityLevel: NutritionActivityLevel;
  goal: NutritionGoalDirection;
  goalRateLbPerWeek?: number;
  calorieAdjustment?: number;
  leanMassLb?: number;
}

export interface NutritionTargetRecommendation {
  bmrCalories: number;
  maintenanceCalories: number;
  calorieAdjustment: number;
  suggestedCalories: number;
  suggestedProteinGrams: number;
  proteinBasis: "LeanMass" | "BodyWeight";
  method: "MifflinStJeor";
}

const ACTIVITY_MULTIPLIERS: Record<NutritionActivityLevel, number> = {
  Sedentary: 1.2,
  Light: 1.375,
  Moderate: 1.55,
  VeryActive: 1.725,
  ExtraActive: 1.9,
};

function roundTo(value: number, increment: number) {
  return Math.round(value / increment) * increment;
}

function requirePositive(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be greater than zero.`);
  }
}

export function calculateNutritionTargetRecommendation(
  input: NutritionTargetRecommendationInput
): NutritionTargetRecommendation {
  requirePositive(input.ageYears, "Age");
  requirePositive(input.heightInches, "Height");
  requirePositive(input.weightLb, "Weight");

  if (
    input.leanMassLb !== undefined &&
    (!Number.isFinite(input.leanMassLb) ||
      input.leanMassLb <= 0 ||
      input.leanMassLb > input.weightLb)
  ) {
    throw new Error("Lean mass must be greater than zero and no more than body weight.");
  }

  if (
    input.goalRateLbPerWeek !== undefined &&
    (!Number.isFinite(input.goalRateLbPerWeek) || input.goalRateLbPerWeek < 0)
  ) {
    throw new Error("Goal rate cannot be negative.");
  }

  const weightKg = input.weightLb * 0.45359237;
  const heightCm = input.heightInches * 2.54;
  const sexConstant = input.sex === "Male" ? 5 : -161;
  const bmr =
    10 * weightKg + 6.25 * heightCm - 5 * input.ageYears + sexConstant;
  const maintenance = bmr * ACTIVITY_MULTIPLIERS[input.activityLevel];

  const defaultRate = input.goal === "Maintain" ? 0 : 0.5;
  const goalRate = input.goalRateLbPerWeek ?? defaultRate;
  const formulaAdjustment =
    input.goal === "Maintain"
      ? 0
      : (goalRate * 3500) / 7 * (input.goal === "Lose" ? -1 : 1);
  const calorieAdjustment = input.calorieAdjustment ?? formulaAdjustment;

  const proteinBasis =
    input.leanMassLb !== undefined ? "LeanMass" : "BodyWeight";
  const proteinGrams =
    input.leanMassLb !== undefined
      ? input.leanMassLb
      : input.weightLb * (input.goal === "Lose" ? 0.9 : 0.8);

  return {
    bmrCalories: roundTo(bmr, 10),
    maintenanceCalories: roundTo(maintenance, 10),
    calorieAdjustment: roundTo(calorieAdjustment, 10),
    suggestedCalories: roundTo(maintenance + calorieAdjustment, 10),
    suggestedProteinGrams: roundTo(proteinGrams, 5),
    proteinBasis,
    method: "MifflinStJeor",
  };
}
