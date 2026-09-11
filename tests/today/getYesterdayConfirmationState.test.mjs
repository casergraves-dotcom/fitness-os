import assert from "node:assert/strict";
import test from "node:test";

import {
  getPreviousLocalCalendarDate,
  shouldShowYesterdayConfirmation,
} from "../../features/today/utils/getYesterdayConfirmationState.ts";

const record = (date, confirmedAt) => ({ date, confirmedAt });

test("unconfirmed nutrition-only and steps-only days surface confirmation", () => {
  assert.equal(shouldShowYesterdayConfirmation({ currentDate: "2026-09-11", nutritionRecord: record("2026-09-10"), stepRecord: null }), true);
  assert.equal(shouldShowYesterdayConfirmation({ currentDate: "2026-09-11", nutritionRecord: null, stepRecord: record("2026-09-10") }), true);
});

test("confirmation disappears only after every available record is confirmed", () => {
  const confirmedAt = "2026-09-11T15:00:00.000Z";
  assert.equal(shouldShowYesterdayConfirmation({ currentDate: "2026-09-11", nutritionRecord: record("2026-09-10", confirmedAt), stepRecord: record("2026-09-10") }), true);
  assert.equal(shouldShowYesterdayConfirmation({ currentDate: "2026-09-11", nutritionRecord: record("2026-09-10", confirmedAt), stepRecord: record("2026-09-10", confirmedAt) }), false);
  assert.equal(shouldShowYesterdayConfirmation({ currentDate: "2026-09-11", nutritionRecord: null, stepRecord: null }), false);
});

test("local yesterday crosses Saturday to Sunday and Sunday to Monday", () => {
  assert.equal(getPreviousLocalCalendarDate(new Date(2026, 8, 6, 8)), "2026-09-05");
  assert.equal(getPreviousLocalCalendarDate(new Date(2026, 8, 7, 8)), "2026-09-06");
});
