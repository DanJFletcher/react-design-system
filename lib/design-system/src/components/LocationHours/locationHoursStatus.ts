import type {
  BusinessDayOfWeek,
  BusinessHour,
  BusinessHoursException,
} from "../ContactSection/ContactSection";
import type { LocationHoursOpenStatusOptions } from "./LocationHours";

const MINUTES_PER_DAY = 24 * 60;
const WEEKDAY_BY_SHORT_NAME: Record<string, BusinessDayOfWeek> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

type LocalDateParts = {
  year: number;
  month: number;
  day: number;
  dayOfWeek: BusinessDayOfWeek;
  minuteOfDay: number;
};

type MinuteInterval = {
  start: number;
  end: number;
};

export type LocationHoursStatus = {
  state: "open" | "closed";
  message: string;
};

function parseClockTime(value: string, allowEndOfDay: boolean): number {
  const match = /^(?:([01]\d|2[0-3]):([0-5]\d)|(24):00)$/.exec(value);
  if (!match || (match[3] === "24" && !allowEndOfDay)) {
    throw new Error(
      `Invalid business-hours time "${value}". Use 24-hour HH:mm format.`,
    );
  }
  if (match[3] === "24") return MINUTES_PER_DAY;
  return Number(match[1]) * 60 + Number(match[2]);
}

function validateIntervals(
  intervals: readonly { opensAt: string; closesAt: string }[],
  label: string,
): void {
  for (const interval of intervals) {
    const opensAt = parseClockTime(interval.opensAt, false);
    const closesAt = parseClockTime(interval.closesAt, true);
    if (opensAt === closesAt) {
      throw new Error(
        `Business-hours interval on "${label}" must have different opening and closing times.`,
      );
    }
  }
}

function getSchedule(hours: readonly BusinessHour[]): Map<BusinessDayOfWeek, BusinessHour> {
  if (hours.length !== 7) {
    throw new Error(
      "Open status requires one business-hours entry for each day of the week.",
    );
  }

  const schedule = new Map<BusinessDayOfWeek, BusinessHour>();
  for (const entry of hours) {
    if (entry.dayOfWeek == null || entry.intervals == null) {
      throw new Error(
        "Open status requires dayOfWeek and intervals on every business-hours entry.",
      );
    }
    if (!Number.isInteger(entry.dayOfWeek) || entry.dayOfWeek < 0 || entry.dayOfWeek > 6) {
      throw new Error(`Invalid dayOfWeek on business-hours entry "${entry.day}".`);
    }
    if (schedule.has(entry.dayOfWeek)) {
      throw new Error(`Duplicate business-hours entry for weekday ${entry.dayOfWeek}.`);
    }
    validateIntervals(entry.intervals, entry.day);
    schedule.set(entry.dayOfWeek, entry);
  }

  if (schedule.size !== 7) {
    throw new Error("Open status requires a unique schedule entry for every weekday.");
  }
  return schedule;
}

function parseDateKey(value: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error(`Invalid special-hours date "${value}". Use YYYY-MM-DD format.`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1000 || month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error(`Invalid special-hours date "${value}".`);
  }
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year
    || parsed.getUTCMonth() !== month - 1
    || parsed.getUTCDate() !== day
  ) {
    throw new Error(`Invalid special-hours date "${value}".`);
  }
  return { year, month, day };
}

function dateKey(parts: { year: number; month: number; day: number }): string {
  return `${String(parts.year).padStart(4, "0")}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function dateKeyAtOffset(
  base: { year: number; month: number; day: number },
  offset: number,
): string {
  const date = new Date(Date.UTC(base.year, base.month - 1, base.day + offset));
  return dateKey({
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  });
}

function daysBetween(startDate: string, endDate: string): number {
  const start = parseDateKey(startDate);
  const end = parseDateKey(endDate);
  return Math.round(
    (Date.UTC(end.year, end.month - 1, end.day) - Date.UTC(start.year, start.month - 1, start.day))
      / (MINUTES_PER_DAY * 60_000),
  );
}

export function validateBusinessHoursExceptions(
  exceptions: readonly BusinessHoursException[],
): Map<string, BusinessHoursException> {
  const byDate = new Map<string, BusinessHoursException>();
  const ids = new Set<string>();
  for (const exception of exceptions) {
    if (!Array.isArray(exception.intervals)) {
      throw new Error(
        `Special-hours entry "${exception.label ?? exception.id}" requires an intervals array.`,
      );
    }
    parseDateKey(exception.date);
    if (byDate.has(exception.date)) {
      throw new Error(`Duplicate special-hours override for ${exception.date}.`);
    }
    if (!exception.id || ids.has(exception.id)) {
      throw new Error(`Special-hours entries need unique, non-empty ids ("${exception.id}").`);
    }
    validateIntervals(exception.intervals, exception.label ?? exception.date);
    byDate.set(exception.date, exception);
    ids.add(exception.id);
  }
  return byDate;
}

function getLocalDateParts(now: Date, timeZone: string): LocalDateParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;
  const dayName = value("weekday");
  const dayOfWeek = dayName ? WEEKDAY_BY_SHORT_NAME[dayName] : undefined;
  const year = Number(value("year"));
  const month = Number(value("month"));
  const day = Number(value("day"));
  const hour = Number(value("hour"));
  const minute = Number(value("minute"));
  if (
    dayOfWeek == null
    || !Number.isInteger(year)
    || !Number.isInteger(month)
    || !Number.isInteger(day)
    || !Number.isInteger(hour)
    || !Number.isInteger(minute)
  ) {
    throw new Error(`Could not read the current time in timezone "${timeZone}".`);
  }
  return {
    year,
    month,
    day,
    dayOfWeek,
    minuteOfDay: hour * 60 + minute,
  };
}

export function getBusinessDateKey(now: Date, timeZone: string): string {
  const { year, month, day } = getLocalDateParts(now, timeZone);
  return dateKey({ year, month, day });
}

export function formatBusinessDate(value: string, locale?: string): string {
  const { year, month, day } = parseDateKey(value);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

function intervalsForDate(
  offset: number,
  date: string,
  dayOfWeek: BusinessDayOfWeek,
  schedule: Map<BusinessDayOfWeek, BusinessHour>,
  exceptions: Map<string, BusinessHoursException>,
): MinuteInterval[] {
  const exception = exceptions.get(date);
  const intervals = exception?.intervals ?? schedule.get(dayOfWeek)?.intervals ?? [];
  return intervals.map(({ opensAt, closesAt }) => {
    const start = offset * MINUTES_PER_DAY + parseClockTime(opensAt, false);
    let end = offset * MINUTES_PER_DAY + parseClockTime(closesAt, true);
    if (end <= start) end += MINUTES_PER_DAY;
    return { start, end };
  });
}

function mergeIntervals(intervals: MinuteInterval[]): MinuteInterval[] {
  intervals.sort((left, right) => left.start - right.start);
  return intervals.reduce<MinuteInterval[]>((merged, interval) => {
    const previous = merged.at(-1);
    if (previous && interval.start <= previous.end) {
      previous.end = Math.max(previous.end, interval.end);
    } else {
      merged.push({ ...interval });
    }
    return merged;
  }, []);
}

function formatTime(minutes: number, locale?: string): string {
  const minuteOfDay = ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const clock = new Date(Date.UTC(2024, 0, 1, Math.floor(minuteOfDay / 60), minuteOfDay % 60));
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(clock);
}

function formatDayOffset(offset: number, locale?: string): string {
  if (offset <= 0) return "";
  return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(offset, "day");
}

function nextRegularOpening(
  schedule: Map<BusinessDayOfWeek, BusinessHour>,
  exceptions: Map<string, BusinessHoursException>,
  today: string,
  dayOfWeek: BusinessDayOfWeek,
  minuteOfDay: number,
): MinuteInterval | undefined {
  const candidates: MinuteInterval[] = [];
  for (const [scheduleDay, entry] of schedule) {
    if (!entry.intervals?.length) continue;
    let offset = (scheduleDay - dayOfWeek + 7) % 7;
    while (true) {
      const occurrenceDate = dateKeyAtOffset(parseDateKey(today), offset);
      if (exceptions.has(occurrenceDate)) {
        offset += 7;
        continue;
      }
      const dayIntervals = entry.intervals
        .map(({ opensAt }) => ({
          start: offset * MINUTES_PER_DAY + parseClockTime(opensAt, false),
          end: offset * MINUTES_PER_DAY + parseClockTime(opensAt, false),
        }))
        .filter((interval) => interval.start > minuteOfDay)
        .sort((left, right) => left.start - right.start);
      if (dayIntervals.length) {
        candidates.push(dayIntervals[0]!);
        break;
      }
      offset += 7;
    }
  }
  return candidates.sort((left, right) => left.start - right.start)[0];
}

function nextExceptionOpening(
  exceptions: Map<string, BusinessHoursException>,
  today: string,
  minuteOfDay: number,
): MinuteInterval | undefined {
  const candidates: MinuteInterval[] = [];
  for (const exception of exceptions.values()) {
    const offset = daysBetween(today, exception.date);
    if (offset < 0) continue;
    for (const { opensAt } of exception.intervals) {
      const start = offset * MINUTES_PER_DAY + parseClockTime(opensAt, false);
      if (start > minuteOfDay) candidates.push({ start, end: start });
    }
  }
  return candidates.sort((left, right) => left.start - right.start)[0];
}

export function getLocationHoursStatus(
  hours: readonly BusinessHour[],
  options: LocationHoursOpenStatusOptions,
  now: Date,
  specialHours: readonly BusinessHoursException[] = [],
): LocationHoursStatus {
  if (!options.timeZone.trim()) {
    throw new Error("Open status requires the business location's IANA timezone.");
  }
  const schedule = getSchedule(hours);
  const exceptions = validateBusinessHoursExceptions(specialHours);
  const localNow = getLocalDateParts(now, options.timeZone);
  const today = dateKey(localNow);
  const currentDay = localNow.dayOfWeek;
  const intervals = mergeIntervals([
    ...intervalsForDate(
      -1,
      dateKeyAtOffset(localNow, -1),
      ((currentDay + 6) % 7) as BusinessDayOfWeek,
      schedule,
      exceptions,
    ),
    ...intervalsForDate(0, today, currentDay, schedule, exceptions),
  ]);
  const currentInterval = intervals.find(
    (interval) => interval.start <= localNow.minuteOfDay && localNow.minuteOfDay < interval.end,
  );

  if (currentInterval) {
    const closeDayOffset = Math.floor(currentInterval.end / MINUTES_PER_DAY);
    const closesAt = formatTime(currentInterval.end, options.locale);
    const closesText = closeDayOffset > 0
      ? `${formatDayOffset(closeDayOffset, options.locale)} at ${closesAt}`
      : `at ${closesAt}`;
    return {
      state: "open",
      message: `Open now · Closes ${closesText}`,
    };
  }

  const regularOpening = nextRegularOpening(
    schedule,
    exceptions,
    today,
    currentDay,
    localNow.minuteOfDay,
  );
  const exceptionOpening = nextExceptionOpening(
    exceptions,
    today,
    localNow.minuteOfDay,
  );
  const nextOpening = [regularOpening, exceptionOpening]
    .filter((interval): interval is MinuteInterval => interval != null)
    .sort((left, right) => left.start - right.start)[0];

  if (!nextOpening) {
    return { state: "closed", message: "Closed" };
  }
  const openDayOffset = Math.floor(nextOpening.start / MINUTES_PER_DAY);
  const opensAt = formatTime(nextOpening.start, options.locale);
  const opensText = openDayOffset > 0
    ? `${formatDayOffset(openDayOffset, options.locale)} at ${opensAt}`
    : `at ${opensAt}`;
  return {
    state: "closed",
    message: `Closed · Opens ${opensText}`,
  };
}
