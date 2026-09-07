import assert from "node:assert/strict";
import test from "node:test";

import {
  isPresentedRestDay,
} from "../../features/today/utils/isPresentedRestDay.ts";


const rest = {
  id: "rest",
  type: "Rest",
  label: "Rest",
  optional: true,
};


test("presents a rest-only date as a rest day", () => {
  assert.equal(isPresentedRestDay([rest]), true);
});


test("keeps optional recovery work under a rest-day heading", () => {
  assert.equal(
    isPresentedRestDay([
      rest,
      {
        id: "easy-walk",
        type: "Walk",
        label: "Easy Walk",
        optional: true,
        cardioIntensity: "Easy",
        durationMin: 20,
        durationMax: 30,
      },
      {
        id: "mobility",
        type: "Mobility",
        label: "Stretch & Recovery",
        optional: true,
      },
    ]),
    true,
  );
});


test("does not call a date a rest day after strength is moved onto it", () => {
  assert.equal(
    isPresentedRestDay([
      rest,
      {
        id: "gym-a",
        type: "Strength",
        label: "Gym A",
        strengthWorkout: "Gym A",
      },
    ]),
    false,
  );
});


test("does not hide an optional aerial session behind a rest-day label", () => {
  assert.equal(
    isPresentedRestDay([
      rest,
      {
        id: "aerial",
        type: "Aerial",
        label: "Lyra",
        optional: true,
      },
    ]),
    false,
  );
});


test("does not describe a longer conditioning walk as rest", () => {
  assert.equal(
    isPresentedRestDay([
      rest,
      {
        id: "long-walk",
        type: "Walk",
        label: "Long Walk / Hike",
        optional: true,
        cardioIntensity: "Easy",
        durationMin: 30,
        durationMax: 45,
      },
    ]),
    false,
  );
});
