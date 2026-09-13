import assert from "node:assert/strict";
import test from "node:test";

import { evaluateScheduleConflicts } from "../../features/workout/logic/evaluateScheduleConflicts.ts";

const occurrence = (date, type, label, durationMax) => ({
  date,
  activity: { id: label, type, label, durationMax },
});

test("run/walk plus long walk or hike creates a same-day caution", () => {
  const result = evaluateScheduleConflicts([
    occurrence("2026-09-12", "Run", "Run / Walk", 25),
    occurrence("2026-09-12", "Walk", "Long Walk / Hike", 60),
  ]);
  assert.equal(result.hasAnyConflict, true);
  assert.equal(result.conflicts[0].kind, "SameDayRunLongWalk");
  assert.equal(result.conflicts[0].severity, "Caution");
});

test("short easy walk and mobility remain compatible", () => {
  const result = evaluateScheduleConflicts([
    occurrence("2026-09-12", "Walk", "Easy Walk", 20),
    occurrence("2026-09-12", "Mobility", "Stretch & Recovery", 20),
  ]);
  assert.equal(result.hasAnyConflict, false);
});

test("run/walk and long walk on separate dates do not create the same-day caution", () => {
  const result = evaluateScheduleConflicts([
    occurrence("2026-09-11", "Run", "Run / Walk", 25),
    occurrence("2026-09-12", "Walk", "Long Walk / Hike", 60),
  ]);
  assert.equal(result.conflicts.some((conflict) => conflict.kind === "SameDayRunLongWalk"), false);
});

test("two hard sessions on one day create a high training-load warning", () => {
  const result = evaluateScheduleConflicts([
    occurrence("2026-09-11", "Strength", "Gym B"),
    occurrence("2026-09-11", "Aerial", "Lyra class"),
  ]);
  assert.equal(result.conflicts.some((conflict) =>
    conflict.kind === "SameDayHardStack" && conflict.severity === "High"
  ), true);
});
