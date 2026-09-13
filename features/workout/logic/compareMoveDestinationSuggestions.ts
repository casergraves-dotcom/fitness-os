export interface MoveDestinationSuggestionRank {
  date: string;
  level: number;
  preferencePenalty: number;
  otherActivityCount: number;
}

// Safety comes first; preferences only choose among equally safe dates.
export function compareMoveDestinationSuggestions(
  first: MoveDestinationSuggestionRank,
  second: MoveDestinationSuggestionRank,
): number {
  return first.level - second.level ||
    first.preferencePenalty - second.preferencePenalty ||
    first.otherActivityCount - second.otherActivityCount ||
    first.date.localeCompare(second.date);
}
