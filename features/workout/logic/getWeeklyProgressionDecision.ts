import type {
  TrainingActivityType,
} from "../types";

import type {
  WeeklyAdherenceResult,
} from "./evaluateWeeklyAdherence";

import type {
  WeeklyRecoveryEvaluation,
} from "./evaluateWeeklyRecovery";

import type {
  WeeklyStrengthQualityEvaluation,
} from "./evaluateWeeklyStrengthQuality";

import type {
  WeeklyRunningLoadEvaluation,
} from "./evaluateWeeklyRunningLoad";
import { WeeklyAerialLoadEvaluation } from "./evaluateWeeklyAerialLoad";


// ============================================================
// Progression Decision
// ============================================================

export type WeeklyProgressionStatus =
  | "Advance"
  | "AdvanceWithWarning"
  | "Hold";


export interface WeeklyProgressionDecision {
  status: WeeklyProgressionStatus;

  shouldAdvance: boolean;

  adherenceRate: number;

  scheduledStrengthCount: number;

  completedStrengthCount: number;

  requiredStrengthCount: number;

  reason: string;

  // Concrete evidence shown with the decision. Keeping these
  // facts in the shared decision object prevents the UI from
  // inventing a different explanation than the progression
  // engine actually used.
  factors: string[];
}


// ============================================================
// Constants
// ============================================================

const PASSING_ADHERENCE_RATE =
  0.8;

const MINIMUM_ADHERENCE_RATE =
  0.6;

const MAX_REQUIRED_STRENGTH_SESSIONS =
  2;


// ============================================================
// Helpers
// ============================================================

function isStrengthActivity(
  type: TrainingActivityType
) {
  return type === "Strength";
}


function formatPercent(
  rate: number
) {
  return `${Math.round(rate * 100)}%`;
}


function getDecisionFactors({
  adherence,
  completedStrengthCount,
  requiredStrengthCount,
}: {
  adherence: WeeklyAdherenceResult;
  completedStrengthCount: number;
  requiredStrengthCount: number;
}) {
  const factors = [
    `${adherence.requiredCompleted} of ${adherence.requiredCount} required activities completed (${formatPercent(adherence.adherenceRate)} adherence).`,
  ];

  if (requiredStrengthCount > 0) {
    factors.push(
      `${completedStrengthCount} of ${requiredStrengthCount} minimum strength sessions completed.`
    );
  } else {
    factors.push(
      "No required strength sessions were scheduled for this week."
    );
  }

  return factors;
}


function applyRecoveryContext(
  decision: WeeklyProgressionDecision,
  recovery:
    WeeklyRecoveryEvaluation | null
): WeeklyProgressionDecision {
  if (
    !recovery ||
    recovery.status === "NoData"
  ) {
    return decision;
  }

  const factors =
    recovery.factor
      ? [
          ...decision.factors,
          recovery.factor,
        ]
      : decision.factors;

  // Recovery can make an adherence-based decision more
  // conservative, but it never upgrades inadequate training
  // adherence. This keeps the two inputs complementary.
  if (
    recovery.status === "Poor"
  ) {
    return {
      ...decision,
      status: "Hold",
      shouldAdvance: false,
      reason:
        "Recent recovery remained too low to increase weekly training load safely.",
      factors,
    };
  }

  if (
    recovery.status === "Limited" &&
    decision.status === "Advance"
  ) {
    return {
      ...decision,
      status:
        "AdvanceWithWarning",
      shouldAdvance: true,
      reason:
        "Training adherence met the target, but recent recovery supports a more conservative advance.",
      factors,
    };
  }

  return {
    ...decision,
    factors,
  };
}


function applyStrengthQualityContext(
  decision: WeeklyProgressionDecision,
  strengthQuality:
    WeeklyStrengthQualityEvaluation | null
): WeeklyProgressionDecision {
  if (
    !strengthQuality ||
    strengthQuality.status === "NoData"
  ) {
    return decision;
  }

  const factors =
    strengthQuality.factor
      ? [
          ...decision.factors,
          strengthQuality.factor,
        ]
      : decision.factors;

  // Strength quality can only make the adherence decision more
  // conservative. It never upgrades a week that did not meet
  // the adherence or minimum-strength requirements.
  if (
    strengthQuality.status === "Poor" &&
    decision.shouldAdvance
  ) {
    return {
      ...decision,
      status: "Hold",
      shouldAdvance: false,
      reason:
        "Too little of the prescribed strength work was completed to increase weekly training load safely.",
      factors,
    };
  }

  if (
    strengthQuality.status === "Limited" &&
    decision.status === "Advance"
  ) {
    return {
      ...decision,
      status: "AdvanceWithWarning",
      shouldAdvance: true,
      reason:
        "Training adherence met the target, but strength-session quality supports a more conservative advance.",
      factors,
    };
  }

  return {
    ...decision,
    factors,
  };
}


function applyRunningLoadContext(
  decision: WeeklyProgressionDecision,
  runningLoad:
    WeeklyRunningLoadEvaluation | null
): WeeklyProgressionDecision {
  if (
    !runningLoad ||
    runningLoad.status === "NoData"
  ) {
    return decision;
  }

  const factors =
    runningLoad.factor
      ? [
          ...decision.factors,
          runningLoad.factor,
        ]
      : decision.factors;

  // Running completion is already represented by adherence. This
  // context evaluates the quality/load of completed scheduled runs
  // and can only make an advance more conservative.
  if (
    runningLoad.status === "Poor" &&
    decision.shouldAdvance
  ) {
    return {
      ...decision,
      status: "Hold",
      shouldAdvance: false,
      reason:
        "Scheduled running was completed at too little of the prescribed load to increase the overall training week safely.",
      factors,
    };
  }

  if (
    runningLoad.status === "Limited" &&
    decision.status === "Advance"
  ) {
    return {
      ...decision,
      status: "AdvanceWithWarning",
      shouldAdvance: true,
      reason:
        "Training adherence met the target, but running load supports a more conservative advance.",
      factors,
    };
  }

  return {
    ...decision,
    factors,
  };
}

function applyAerialLoadContext(
  decision: WeeklyProgressionDecision,
  aerialLoad:
    WeeklyAerialLoadEvaluation | null
): WeeklyProgressionDecision {
  if (
    !aerialLoad ||
    aerialLoad.status === "NoData"
  ) {
    return decision;
  }

  const factors =
    aerialLoad.factor
      ? [
          ...decision.factors,
          aerialLoad.factor,
        ]
      : decision.factors;

  // Aerial participation is meaningful training load, but the
  // current completion model does not record enough information
  // to judge session quality or fatigue directly.
  //
  // Therefore aerial participation contributes evidence to the
  // weekly decision without independently upgrading or
  // downgrading it. Recovery remains responsible for determining
  // whether the overall training load was poorly tolerated.

  return {
    ...decision,
    factors,
  };
}


function applyDecisionContext(
  decision: WeeklyProgressionDecision,
  recovery:
    WeeklyRecoveryEvaluation | null,
  strengthQuality:
    WeeklyStrengthQualityEvaluation | null,
  runningLoad:
    WeeklyRunningLoadEvaluation | null,
  aerialLoad:
    WeeklyAerialLoadEvaluation | null
) {
  // Apply quality first, then recovery. Recovery therefore keeps
  // final authority to hold a week when readiness is poor.
  return applyRecoveryContext(
    applyAerialLoadContext(
      applyRunningLoadContext(
        applyStrengthQualityContext(
          decision,
          strengthQuality
        ),
        runningLoad
      ),
      aerialLoad
    ),
    recovery
  );
}


// ============================================================
// Get Weekly Progression Decision
// ============================================================

export function getWeeklyProgressionDecision(
  adherence: WeeklyAdherenceResult,
  recovery:
    WeeklyRecoveryEvaluation | null = null,
  strengthQuality:
    WeeklyStrengthQualityEvaluation | null = null,
  runningLoad:
    WeeklyRunningLoadEvaluation | null = null,
  aerialLoad:
    WeeklyAerialLoadEvaluation | null = null
): WeeklyProgressionDecision {
  // ----------------------------------------------------------
  // Strength Sessions
  // ----------------------------------------------------------

  // Ordinary required strength activities count individually.
  //
  // Activities inside substitution groups are intentionally
  // marked non-required by evaluateWeeklyAdherence(), because
  // the group itself represents one training requirement.
  const requiredStrengthActivities =
    adherence.activities.filter(
      (item) =>
        item.required &&
        isStrengthActivity(
          item.activity.type
        )
    );

  const completedRequiredStrengthActivities =
    requiredStrengthActivities.filter(
      (item) =>
        item.completed
    );


  // A substitution group containing strength work counts as
  // ONE scheduled strength requirement, regardless of how many
  // interchangeable activities are in the group.
  const strengthSubstitutionGroups =
    adherence.substitutionGroups.filter(
      (group) =>
        group.activities.some(
          (item) =>
            isStrengthActivity(
              item.activity.type
            )
        )
    );

  // The group counts as a completed strength requirement only
  // when a Strength activity in that group was completed.
  //
  // This avoids a mixed substitution group being credited as a
  // strength session if only a non-strength alternative was done.
  const completedStrengthSubstitutionGroups =
    strengthSubstitutionGroups.filter(
      (group) =>
        group.activities.some(
          (item) =>
            isStrengthActivity(
              item.activity.type
            ) &&
            item.completed
        )
    );


  const scheduledStrengthCount =
    requiredStrengthActivities.length +
    strengthSubstitutionGroups.length;

  const completedStrengthCount =
    completedRequiredStrengthActivities.length +
    completedStrengthSubstitutionGroups.length;


  // Require up to two strength sessions, but never require
  // more than the current program week actually prescribes.
  const requiredStrengthCount =
    Math.min(
      MAX_REQUIRED_STRENGTH_SESSIONS,
      scheduledStrengthCount
    );


  const strengthRequirementMet =
    completedStrengthCount >=
      requiredStrengthCount;

  const factors =
    getDecisionFactors({
      adherence,
      completedStrengthCount,
      requiredStrengthCount,
    });


  // ----------------------------------------------------------
  // Strong Week
  // ----------------------------------------------------------

  if (
    adherence.adherenceRate >=
      PASSING_ADHERENCE_RATE &&
    strengthRequirementMet
  ) {
    return applyDecisionContext({
      status: "Advance",

      shouldAdvance: true,

      adherenceRate:
        adherence.adherenceRate,

      scheduledStrengthCount,

      completedStrengthCount,

      requiredStrengthCount,

      reason:
        "Weekly training adherence met the progression target.",

      factors,
    }, recovery, strengthQuality, runningLoad, aerialLoad);
  }


  // ----------------------------------------------------------
  // Borderline Week
  // ----------------------------------------------------------
  //
  // A 60–79% week may still advance, but only when the
  // minimum strength requirement was completed.
  //
  // This prevents missed accessory/cardio work from holding
  // the entire program while still protecting the strength
  // progression that anchors the program.

  if (
    adherence.adherenceRate >=
      MINIMUM_ADHERENCE_RATE &&
    strengthRequirementMet
  ) {
    return applyDecisionContext({
      status:
        "AdvanceWithWarning",

      shouldAdvance: true,

      adherenceRate:
        adherence.adherenceRate,

      scheduledStrengthCount,

      completedStrengthCount,

      requiredStrengthCount,

      reason:
        "The week had reduced adherence, but enough key training was completed to continue progressing.",

      factors,
    }, recovery, strengthQuality, runningLoad, aerialLoad);
  }


  // ----------------------------------------------------------
  // Hold Week
  // ----------------------------------------------------------

  let reason =
    "Weekly adherence was too low to progress safely.";

  if (!strengthRequirementMet) {
    reason =
      requiredStrengthCount === 1
        ? "The required strength session was not completed."
        : `Only ${completedStrengthCount} of the minimum ${requiredStrengthCount} strength sessions were completed.`;
  }


  return applyDecisionContext({
    status: "Hold",

    shouldAdvance: false,

    adherenceRate:
      adherence.adherenceRate,

    scheduledStrengthCount,

    completedStrengthCount,

    requiredStrengthCount,

    reason,

    factors,
  }, recovery, strengthQuality, runningLoad, aerialLoad);
}
