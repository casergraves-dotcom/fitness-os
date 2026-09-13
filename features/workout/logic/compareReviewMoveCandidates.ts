import type { ResolvedWeeklyActivityOccurrence } from "./getResolvedWeeklyActivityOccurrences";

export interface RankedReviewMoveCandidate {
  occurrence: ResolvedWeeklyActivityOccurrence;
  date: string;
  remainingLoad: number;
  preferencePenalty?: number;
}

export function compareReviewMoveCandidates(
  first: RankedReviewMoveCandidate,
  second: RankedReviewMoveCandidate,
): number {
  return first.remainingLoad - second.remainingLoad ||
    Number(first.occurrence.activity.optional !== true) -
      Number(second.occurrence.activity.optional !== true) ||
    (first.preferencePenalty ?? 0) - (second.preferencePenalty ?? 0) ||
    Math.abs(Date.parse(first.date) - Date.parse(first.occurrence.date)) -
      Math.abs(Date.parse(second.date) - Date.parse(second.occurrence.date)) ||
    first.date.localeCompare(second.date);
}
