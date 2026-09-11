export const POUNDS_PER_KILOGRAM = 2.2046226218;
export const KILOGRAMS_PER_POUND = 0.45359237;

export function kilogramsToPounds(kilograms: number) {
  return kilograms * POUNDS_PER_KILOGRAM;
}

export function poundsToKilograms(pounds: number) {
  return pounds * KILOGRAMS_PER_POUND;
}

export function roundConvertedWeight(value: number) {
  return Math.round(value * 100) / 100;
}
