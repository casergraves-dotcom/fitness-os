import type { MorningCheckInRatings } from "@/features/recovery";
import type { MobilityRoutineId } from "@/features/workout/types";

export interface SorenessMobilityRecommendation {
  routineId: MobilityRoutineId;
  message: string;
}

export function getSorenessMobilityRecommendation(
  ratings: MorningCheckInRatings
): SorenessMobilityRecommendation | null {
  const upper = ratings.UpperBodySoreness;
  const lower = ratings.LowerBodySoreness;

  if (upper < 3 && lower < 3) return null;

  if (upper >= 3 && lower >= 3) {
    return {
      routineId: "full-body-recovery",
      message:
        "Your check-in reports noticeable upper- and lower-body soreness. This gentle full-body option may be useful if it feels restorative.",
    };
  }

  if (upper >= 3) {
    return {
      routineId: "post-aerial",
      message:
        "Your check-in reports noticeable upper-body soreness. This routine emphasizes the shoulders, lats, chest, hips, and glutes.",
    };
  }

  return {
    routineId: "post-run",
    message:
      "Your check-in reports noticeable lower-body soreness. This routine emphasizes the calves, hips, glutes, and inner thighs.",
  };
}
