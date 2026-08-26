"use client";

import {
  useMemo,
} from "react";

import type {
  BodyCompositionGoal,
} from "../bodyCompositionTypes";

import type {
  BodyWeightTrendEntry,
} from "./useBodyCompositionTrends";


// ============================================================
// Types
// ============================================================

export interface BodyCompositionMilestone {
  id:
    string;

  label:
    string;

  description:
    string;

  achieved:
    boolean;

  achievedDate?:
    string;

  targetWeightLb:
    number;
}


// ============================================================
// Helpers
// ============================================================

function roundToTenth(
  value:
    number
) {
  return (
    Math.round(
      value *
      10
    ) /
    10
  );
}


function findFirstReachedDate(
  weightTrend:
    BodyWeightTrendEntry[],
  targetWeightLb:
    number,
  losingWeight:
    boolean
) {
  const reached =
    weightTrend.find(
      (
        entry
      ) =>
        losingWeight
          ? entry.trendWeightLb <=
            targetWeightLb
          : entry.trendWeightLb >=
            targetWeightLb
    );

  return reached?.date;
}


// ============================================================
// Hook
// ============================================================

export function useBodyCompositionMilestones(
  currentGoal:
    BodyCompositionGoal |
    null,
  weightTrend:
    BodyWeightTrendEntry[]
) {
  return useMemo<
    BodyCompositionMilestone[]
  >(
    () => {
      if (
        !currentGoal ||
        weightTrend.length ===
        0 ||
        currentGoal.targetWeightLb ===
        undefined
      ) {
        return [];
      }

      const firstTrendWeightLb =
        weightTrend[0]
          .trendWeightLb;

      const targetWeightLb =
        currentGoal.targetWeightLb;

      const losingWeight =
        targetWeightLb <
        firstTrendWeightLb;

      const totalGoalChange =
        targetWeightLb -
        firstTrendWeightLb;

      if (
        Math.abs(
          totalGoalChange
        ) <
        0.05
      ) {
        return [];
      }


      const candidates:
        Array<{
          id:
            string;

          label:
            string;

          description:
            string;

          targetWeightLb:
            number;
        }> = [];


      // --------------------------------------------------------
      // Fixed Weight-Change Milestones
      // --------------------------------------------------------

      const milestoneAmounts = [
        5,
        10,
        15,
      ];

      for (
        const amount
        of milestoneAmounts
      ) {
        const milestoneWeight =
          losingWeight
            ? firstTrendWeightLb -
              amount
            : firstTrendWeightLb +
              amount;

        const fallsBeforeGoal =
          losingWeight
            ? milestoneWeight >
              targetWeightLb
            : milestoneWeight <
              targetWeightLb;

        if (
          fallsBeforeGoal
        ) {
          candidates.push({
            id:
              `${amount}-lb-change`,

            label:
              `${amount} lb ${losingWeight ? "lost" : "gained"}`,

            description:
              `Reach a ${amount} lb change from the starting weight trend.`,

            targetWeightLb:
              roundToTenth(
                milestoneWeight
              ),
          });
        }
      }


      // --------------------------------------------------------
      // Halfway Milestone
      // --------------------------------------------------------

      const halfwayWeight =
        firstTrendWeightLb +
        (
          totalGoalChange /
          2
        );

      candidates.push({
        id:
          "halfway",

        label:
          "Halfway to goal",

        description:
          "Reach 50% of the planned weight change.",

        targetWeightLb:
          roundToTenth(
            halfwayWeight
          ),
      });


      // --------------------------------------------------------
      // Goal Milestone
      // --------------------------------------------------------

      candidates.push({
        id:
          "goal",

        label:
          "Goal reached",

        description:
          "Reach the current target weight.",

        targetWeightLb:
          roundToTenth(
            targetWeightLb
          ),
      });


      // --------------------------------------------------------
      // Deduplicate Similar Milestones
      // --------------------------------------------------------

      const deduplicated =
        candidates.filter(
          (
            candidate,
            index,
            all
          ) =>
            all.findIndex(
              (
                other
              ) =>
                Math.abs(
                  other.targetWeightLb -
                  candidate.targetWeightLb
                ) <
                0.5
            ) ===
            index
        );


      // --------------------------------------------------------
      // Achievement State
      // --------------------------------------------------------

      return deduplicated
        .map(
          (
            milestone
          ) => {
            const achievedDate =
              findFirstReachedDate(
                weightTrend,
                milestone.targetWeightLb,
                losingWeight
              );

            return {
              ...milestone,

              achieved:
                achievedDate !==
                undefined,

              achievedDate,
            };
          }
        )
        .sort(
          (
            a,
            b
          ) =>
            losingWeight
              ? b.targetWeightLb -
                a.targetWeightLb
              : a.targetWeightLb -
                b.targetWeightLb
        );
    },
    [
      currentGoal,
      weightTrend,
    ]
  );
}