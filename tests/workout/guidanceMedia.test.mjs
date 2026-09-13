import assert from "node:assert/strict";
import test from "node:test";

import { getReviewedGuidanceImages } from "../../features/workout/guidanceMedia.ts";

test("workout guidance displays only described, bundled images", () => {
  const media = [
    { type: "Image", source: "/exercise-guides/chest-press.webp", description: "Chest press machine" },
    { type: "Image", source: "https://example.com/chest-press.webp", description: "Remote machine" },
    { type: "Image", source: "/exercise-guides/unknown.webp", description: " " },
    { type: "Video", source: "/exercise-guides/press.mp4", description: "Press demo" },
  ];

  assert.deepEqual(getReviewedGuidanceImages(media), [media[0]]);
  assert.deepEqual(getReviewedGuidanceImages(undefined), []);
});
