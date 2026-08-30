export function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addTrainingWeekDays(date: Date, days: number) {
  const result = startOfLocalDay(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function formatLocalCalendarDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseLocalCalendarDate(dateString: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return formatLocalCalendarDate(date) === dateString ? date : null;
}

export function getTrainingWeekStart(date: Date) {
  const result = startOfLocalDay(date);
  result.setDate(result.getDate() - result.getDay());
  return result;
}

export function getTrainingWeekStartDate(date: Date) {
  return formatLocalCalendarDate(getTrainingWeekStart(date));
}

export function getTrainingWeekStartOnOrAfter(date: Date) {
  const result = startOfLocalDay(date);
  const daysUntilSunday = (7 - result.getDay()) % 7;
  result.setDate(result.getDate() + daysUntilSunday);
  return result;
}

export function normalizeLegacyTrainingWeekStartDate(dateString: string) {
  const date = parseLocalCalendarDate(dateString);
  return date ? getTrainingWeekStartDate(date) : dateString;
}
