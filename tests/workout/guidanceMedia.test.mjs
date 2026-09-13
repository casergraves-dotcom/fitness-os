import assert from "node:assert/strict";
import test from "node:test";

import { getReviewedGuidanceImages } from "../../features/workout/guidanceMedia.ts";
import { exerciseLibrary } from "../../features/workout/exerciseLibrary.ts";

const attribution = {
  creator: "Example Photographer",
  sourceUrl: "https://commons.wikimedia.org/wiki/File:Example.jpg",
  license: "CC BY-SA 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  changes: "Resized",
};

test("workout guidance displays only described, bundled images", () => {
  const media = [
    { type: "Image", source: "/exercise-guides/chest-press.webp", description: "Chest press machine", width: 500, height: 667, attribution },
    { type: "Image", source: "https://example.com/chest-press.webp", description: "Remote machine", attribution },
    { type: "Image", source: "/exercise-guides/unknown.webp", description: " ", attribution },
    { type: "Image", source: "/exercise-guides/uncredited.webp", description: "Uncredited machine" },
    { type: "Video", source: "/exercise-guides/press.mp4", description: "Press demo" },
  ];

  assert.deepEqual(getReviewedGuidanceImages(media), [media[0]]);
  assert.deepEqual(getReviewedGuidanceImages(undefined), []);
});

test("leg press has one attributed example machine photo", () => {
  const legPress = exerciseLibrary.find((exercise) => exercise.id === "leg-press");
  const images = getReviewedGuidanceImages(legPress?.guidance?.demoMedia);
  assert.equal(images.length, 1);
  assert.equal(images[0].source, "/exercise-guides/leg-press-example.jpg");
  assert.equal(images[0].attribution?.license, "CC BY-SA 4.0");
});
