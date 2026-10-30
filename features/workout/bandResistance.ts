import type {
  ExerciseSet,
  ResistanceBandSelection,
} from "./types.ts";

export type BandResistanceSource =
  | "configuration"
  | "legacy-single-band"
  | "none";

export interface BandResistanceDetails {
  selections: ResistanceBandSelection[];
  nominalResistanceLb: number;
  source: BandResistanceSource;
}

function normalizeRatedResistance(value: number): number | undefined {
  if (!Number.isFinite(value) || value <= 0) return undefined;
  return value;
}

export function normalizeBandConfiguration(
  selections: readonly ResistanceBandSelection[]
): ResistanceBandSelection[] {
  return selections.flatMap((selection) => {
    const ratedResistanceLb = normalizeRatedResistance(
      selection.ratedResistanceLb
    );

    return ratedResistanceLb === undefined
      ? []
      : [{ ratedResistanceLb }];
  });
}

export function getCombinedBandResistanceLb(
  selections: readonly ResistanceBandSelection[]
): number {
  return normalizeBandConfiguration(selections).reduce(
    (total, selection) => total + selection.ratedResistanceLb,
    0
  );
}

export function getBandResistanceDetails(
  set: Pick<ExerciseSet, "weight" | "bandConfiguration">
): BandResistanceDetails {
  if (set.bandConfiguration !== undefined) {
    const selections = normalizeBandConfiguration(set.bandConfiguration);

    return {
      selections,
      nominalResistanceLb: getCombinedBandResistanceLb(selections),
      source: "configuration",
    };
  }

  const legacyResistance = normalizeRatedResistance(set.weight);
  if (legacyResistance !== undefined) {
    return {
      selections: [{ ratedResistanceLb: legacyResistance }],
      nominalResistanceLb: legacyResistance,
      source: "legacy-single-band",
    };
  }

  return {
    selections: [],
    nominalResistanceLb: 0,
    source: "none",
  };
}

export function withBandConfiguration(
  set: ExerciseSet,
  selections: readonly ResistanceBandSelection[]
): ExerciseSet {
  const bandConfiguration = normalizeBandConfiguration(selections);

  return {
    ...set,
    weight: getCombinedBandResistanceLb(bandConfiguration),
    bandConfiguration,
  };
}
