import { isDailyRecordSettled } from "../../dailyActivity/utils/isDailyRecordSettled.ts";

interface ConfirmableDailyRecord {
  date: string;
  confirmedAt?: string;
}

export function formatLocalCalendarDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getPreviousLocalCalendarDate(now: Date) {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return formatLocalCalendarDate(yesterday);
}

export function shouldShowYesterdayConfirmation({
  currentDate,
  nutritionRecord,
  stepRecord,
}: {
  currentDate: string;
  nutritionRecord: ConfirmableDailyRecord | null;
  stepRecord: ConfirmableDailyRecord | null;
}) {
  if (!nutritionRecord && !stepRecord) return false;

  const nutritionSettled =
    !nutritionRecord ||
    isDailyRecordSettled({
      recordDate: nutritionRecord.date,
      confirmedAt: nutritionRecord.confirmedAt,
      currentDate,
    });

  const stepsSettled =
    !stepRecord ||
    isDailyRecordSettled({
      recordDate: stepRecord.date,
      confirmedAt: stepRecord.confirmedAt,
      currentDate,
    });

  return !nutritionSettled || !stepsSettled;
}
