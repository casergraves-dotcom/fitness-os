const PROVISIONAL_GRACE_DAYS = 1;

function parseLocalDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function differenceInCalendarDays(laterDate: string, earlierDate: string) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.round(
    (parseLocalDate(laterDate).getTime() - parseLocalDate(earlierDate).getTime()) /
      millisecondsPerDay
  );
}

export function isDailyRecordSettled({
  recordDate,
  confirmedAt,
  currentDate,
}: {
  recordDate: string;
  confirmedAt?: string;
  currentDate: string;
}) {
  if (confirmedAt) {
    return true;
  }

  return differenceInCalendarDays(currentDate, recordDate) > PROVISIONAL_GRACE_DAYS;
}
