import type {
  AerialSessionPreference,
  TrainingActivity,
  TrainingDayOfWeek,
} from "../types";

export interface ProjectableAerialOccurrence {
  activity: TrainingActivity;
  originalDate: string;
  day: TrainingDayOfWeek;
}

export interface FixedAerialCommitmentPlacement {
  activity: TrainingActivity;
  originalDate: string;
  scheduledDate: string;
  session: AerialSessionPreference;
}

const DAY_INDEX: Record<TrainingDayOfWeek, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

function addCalendarDays(dateString: string, days: number) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day + days);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function getFixedAerialCommitmentPlacements(
  occurrences: ProjectableAerialOccurrence[],
  sessions: AerialSessionPreference[],
  weekStartDate: string,
) {
  const fixedSessions = sessions.filter(
    (session) => session.constraint === "Fixed",
  );

  if (fixedSessions.length === 0 || occurrences.length === 0) {
    return null;
  }

  const unused = [...occurrences].sort((a, b) =>
    a.originalDate.localeCompare(b.originalDate),
  );
  const placements: FixedAerialCommitmentPlacement[] = [];

  for (const session of fixedSessions) {
    const matchingDayIndex = unused.findIndex(
      (occurrence) => occurrence.day === session.day,
    );
    const selectedIndex = matchingDayIndex >= 0 ? matchingDayIndex : 0;
    const [occurrence] = unused.splice(selectedIndex, 1);

    if (!occurrence) break;

    placements.push({
      activity: occurrence.activity,
      originalDate: occurrence.originalDate,
      scheduledDate: addCalendarDays(weekStartDate, DAY_INDEX[session.day]),
      session,
    });
  }

  return {
    placements,
    templateOccurrences: occurrences,
  };
}
