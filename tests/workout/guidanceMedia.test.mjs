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

test("incline chest press has one attributed example machine photo", () => {
  const inclinePress = exerciseLibrary.find(
    (exercise) => exercise.id === "incline-chest-press-machine",
  );
  const images = getReviewedGuidanceImages(inclinePress?.guidance?.demoMedia);

  assert.equal(images.length, 1);
  assert.equal(images[0].source, "/exercise-guides/incline-chest-press-example.jpg");
  assert.equal(images[0].width, 500);
  assert.equal(images[0].height, 624);
  assert.equal(images[0].attribution?.license, "CC BY-SA 4.0");
});

test("lat pulldown has one attributed example machine photo", () => {
  const latPulldown = exerciseLibrary.find((exercise) => exercise.id === "lat-pulldown");
  const images = getReviewedGuidanceImages(latPulldown?.guidance?.demoMedia);

  assert.equal(images.length, 1);
  assert.equal(images[0].source, "/exercise-guides/lat-pulldown-example.jpg");
  assert.equal(images[0].width, 500);
  assert.equal(images[0].height, 666);
  assert.equal(images[0].attribution?.license, "CC BY-SA 4.0");
});

test("seated row has one attributed example machine photo", () => {
  const seatedRow = exerciseLibrary.find((exercise) => exercise.id === "seated-row");
  const images = getReviewedGuidanceImages(seatedRow?.guidance?.demoMedia);

  assert.equal(images.length, 1);
  assert.equal(images[0].source, "/exercise-guides/seated-row-example.jpg");
  assert.equal(images[0].width, 1280);
  assert.equal(images[0].height, 1143);
  assert.equal(images[0].attribution?.license, "CC BY-SA 4.0");
});

test("pec deck has one attributed example machine photo", () => {
  const pecDeck = exerciseLibrary.find((exercise) => exercise.id === "chest-fly");
  const images = getReviewedGuidanceImages(pecDeck?.guidance?.demoMedia);

  assert.equal(images.length, 1);
  assert.equal(images[0].source, "/exercise-guides/pec-deck-example.jpg");
  assert.equal(images[0].width, 960);
  assert.equal(images[0].height, 640);
  assert.equal(images[0].attribution?.license, "CC BY 2.0");
});
