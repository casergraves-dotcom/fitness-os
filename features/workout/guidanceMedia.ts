import type { ExerciseGuidance } from "./types";

type DemoMedia = NonNullable<ExerciseGuidance["demoMedia"]>[number];

// Only reviewed, bundled image assets are displayed during a workout. External
// media and videos need separate licensing, loading, and playback review.
export function getReviewedGuidanceImages(media: ExerciseGuidance["demoMedia"]): DemoMedia[] {
  return (media ?? []).filter(
    (item) =>
      item.type === "Image" &&
      /^\/exercise-guides\/[a-z0-9/_-]+\.(?:png|jpe?g|webp)$/.test(item.source) &&
      item.description.trim().length > 0 &&
      Number.isInteger(item.width) && (item.width ?? 0) > 0 &&
      Number.isInteger(item.height) && (item.height ?? 0) > 0 &&
      Boolean(item.attribution?.creator.trim()) &&
      Boolean(item.attribution?.license.trim()) &&
      Boolean(item.attribution?.changes.trim()) &&
      /^https:\/\//.test(item.attribution?.sourceUrl ?? "") &&
      /^https:\/\//.test(item.attribution?.licenseUrl ?? ""),
  );
}
