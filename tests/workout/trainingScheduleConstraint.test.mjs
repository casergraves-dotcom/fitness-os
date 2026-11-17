import assert from "node:assert/strict";
import test from "node:test";

import { fitnessOsTrainingPlan } from "../../features/workout/trainingPlan.ts";
import {
  getOccurrenceScheduleConstraint,
} from "../../features/workout/logic/getTrainingActivityScheduleConstraint.ts";
import { getDaySwapTargets } from "../../features/workout/logic/getDaySwapTargets.ts";
import { getReviewMoveCandidates } from "../../features/workout/logic/getReviewMoveCandidates.ts";

test("canonical plan activities expose flexible timing independently of optionality", () => {
  const activities = fitnessOsTrainingPlan.weeks.flatMap((week) =>
    week.days.flatMap((day) => day.activities)
  );

  assert.ok(activities.length > 0);
  assert.equal(
    activities.every((activity) => activity.scheduleConstraint === "Flexible"),
    true
  );
  assert.equal(
    activities.some((activity) => !activity.optional && activity.scheduleConstraint === "Flexible"),
    true
  );
});

test("legacy activities default to flexible while projected commitments resolve fixed", () => {
  const legacy = {
    activity: { id: "legacy", type: "Run", label: "Run / Walk" },
  };
  const projected = {
    ...legacy,
    placementSource: "FixedAerialCommitment",
  };

  assert.equal(getOccurrenceScheduleConstraint(legacy), "Flexible");
  assert.equal(getOccurrenceScheduleConstraint(projected), "Fixed");
});

test("fixed timing is protected even when the activity is not aerial", () => {
  const moving = {
    date: "2026-09-09",
    originalDate: "2026-09-09",
    scheduleConstraint: "Flexible",
    day: "Wednesday",
    activity: { id: "run", type: "Run", label: "Run / Walk" },
  };
  const fixed = {
    date: "2026-09-10",
    originalDate: "2026-09-10",
    scheduleConstraint: "Fixed",
    day: "Thursday",
    activity: {
      id: "appointment",
      type: "Aerial",
      label: "Skills class",
      scheduleConstraint: "Fixed",
    },
  };

  const swap = getDaySwapTargets(
    [moving, fixed],
    fixed.date,
    moving,
    []
  );
  assert.equal(swap.blockedBy, "FixedCommitment");

  const candidates = getReviewMoveCandidates(
    [{
      first: { date: moving.date, activity: moving.activity },
      second: { date: fixed.date, activity: fixed.activity },
      kind: "StrengthAerialAdjacency",
      severity: "Caution",
      reason: "Adjacent load",
    }],
    [moving, fixed],
    [],
    ["2026-09-09", "2026-09-10", "2026-09-11"],
    "2026-09-09"
  );

  assert.equal(
    candidates.some((candidate) => candidate.occurrence.activity.id === fixed.activity.id),
    false
  );
});
