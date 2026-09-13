import type { ExerciseGuidance } from "./types";

type DemoMedia = NonNullable<ExerciseGuidance["demoMedia"]>[number];

// Only reviewed, bundled image assets are displayed during a workout. External
// media and videos need separate licensing, loading, and playback review.
export function getReviewedGuidanceImages(media: ExerciseGuidance["demoMedia"]): DemoMedia[] {
  return (media ?? []).filter(
    (item) =>
      item.type === "Image" &&
      /^\/exercise-guides\/[a-z0-9/_-]+\.(?:png|jpe?g|webp)$/.test(item.source) &&
      item.description.trim().length > 0,
  );
}
