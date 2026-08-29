// ============================================================
// Types
// ============================================================

export type RpeValue =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10;


export type RpeContext =
  | "StrengthSet"
  | "CardioSession";


export interface RpeScaleEntry {
  value:
    RpeValue;

  effortLabel:
    string;

  strengthRepsInReserve:
    number |
    null;

  strengthDescription:
    string;

  cardioDescription:
    string;
}


// ============================================================
// Constants
// ============================================================

export const RPE_MIN:
  RpeValue =
    1;


export const RPE_MAX:
  RpeValue =
    10;


export const RPE_SUSTAINABLE_MAX:
  RpeValue =
    7;


export const RPE_HIGH_EFFORT_MIN:
  RpeValue =
    9;


export const RPE_MAXIMAL:
  RpeValue =
    10;


export const RPE_SCALE:
  RpeScaleEntry[] = [
    {
      value:
        1,

      effortLabel:
        "Very easy",

      strengthRepsInReserve:
        null,

      strengthDescription:
        "Very easy effort with substantial reserve.",

      cardioDescription:
        "Very easy movement with minimal exertion.",
    },
    {
      value:
        2,

      effortLabel:
        "Easy",

      strengthRepsInReserve:
        null,

      strengthDescription:
        "Easy effort with substantial reserve.",

      cardioDescription:
        "Easy effort that can be sustained comfortably.",
    },
    {
      value:
        3,

      effortLabel:
        "Light",

      strengthRepsInReserve:
        null,

      strengthDescription:
        "Light effort with substantial reserve.",

      cardioDescription:
        "Light, comfortable aerobic effort.",
    },
    {
      value:
        4,

      effortLabel:
        "Comfortable",

      strengthRepsInReserve:
        null,

      strengthDescription:
        "Comfortable effort well below the working limit.",

      cardioDescription:
        "Comfortable effort with controlled breathing.",
    },
    {
      value:
        5,

      effortLabel:
        "Moderate",

      strengthRepsInReserve:
        null,

      strengthDescription:
        "Moderate effort with several repetitions remaining.",

      cardioDescription:
        "Moderate effort that remains comfortably sustainable.",
    },
    {
      value:
        6,

      effortLabel:
        "Moderately hard",

      strengthRepsInReserve:
        4,

      strengthDescription:
        "Moderately hard effort with about four repetitions remaining.",

      cardioDescription:
        "Moderately hard but controlled whole-session effort.",
    },
    {
      value:
        7,

      effortLabel:
        "Challenging",

      strengthRepsInReserve:
        3,

      strengthDescription:
        "Challenging effort with about three repetitions remaining.",

      cardioDescription:
        "Challenging but sustainable whole-session effort.",
    },
    {
      value:
        8,

      effortLabel:
        "Hard",

      strengthRepsInReserve:
        2,

      strengthDescription:
        "Hard effort with about two repetitions remaining.",

      cardioDescription:
        "Hard whole-session effort requiring concentration.",
    },
    {
      value:
        9,

      effortLabel:
        "Very hard",

      strengthRepsInReserve:
        1,

      strengthDescription:
        "Very hard effort with about one repetition remaining.",

      cardioDescription:
        "Very hard whole-session effort near the sustainable limit.",
    },
    {
      value:
        10,

      effortLabel:
        "Maximal",

      strengthRepsInReserve:
        0,

      strengthDescription:
        "Maximal effort with no repetitions remaining.",

      cardioDescription:
        "Maximal whole-session effort that could not be sustained longer.",
    },
  ];


// ============================================================
// Validation
// ============================================================

export function isValidRpe(
  value:
    unknown
): value is RpeValue {
  return (
    typeof value ===
      "number" &&
    Number.isInteger(
      value
    ) &&
    value >=
      RPE_MIN &&
    value <=
      RPE_MAX
  );
}


export function normalizeRpe(
  value:
    number
): RpeValue {
  if (
    !Number.isFinite(
      value
    )
  ) {
    return RPE_MIN;
  }

  return Math.min(
    RPE_MAX,
    Math.max(
      RPE_MIN,
      Math.round(
        value
      )
    )
  ) as RpeValue;
}


// ============================================================
// Scale Lookup
// ============================================================

export function getRpeScaleEntry(
  value:
    unknown
): RpeScaleEntry | null {
  if (
    !isValidRpe(
      value
    )
  ) {
    return null;
  }

  return (
    RPE_SCALE[
      value -
        RPE_MIN
    ] ??
    null
  );
}


export function getRpeDescription(
  value:
    unknown,
  context:
    RpeContext
) {
  const entry =
    getRpeScaleEntry(
      value
    );

  if (!entry) {
    return null;
  }

  return context ===
    "StrengthSet"
    ? entry.strengthDescription
    : entry.cardioDescription;
}