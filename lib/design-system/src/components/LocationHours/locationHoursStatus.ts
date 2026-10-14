import type {
  BusinessDayOfWeek,
  BusinessHour,
} from "../ContactSection/ContactSection";
import type { LocationHoursOpenStatusOptions } from "./LocationHours";

const MINUTES_PER_DAY = 24 * 60;
const MINUTES_PER_WEEK = 7 * MINUTES_PER_DAY;
const WEEKDAY_BY_SHORT_NAME: Record<string, BusinessDayOfWeek> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
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
    for (const interval of entry.intervals) {
      const opensAt = parseClockTime(interval.opensAt, false);
      const closesAt = parseClockTime(interval.closesAt, true);
      if (opensAt === closesAt) {
        throw new Error(
          `Business-hours interval on "${entry.day}" must have different opening and closing times.`,
        );
      }
    }
    schedule.set(entry.dayOfWeek, entry);
  }

  if (schedule.size !== 7) {
    throw new Error("Open status requires a unique schedule entry for every weekday.");
  }
  return schedule;
}

function getLocalDateParts(now: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;
  const dayName = value("weekday");
  const dayOfWeek = dayName ? WEEKDAY_BY_SHORT_NAME[dayName] : undefined;
  const hour = Number(value("hour"));
  const minute = Number(value("minute"));
  if (dayOfWeek == null || !Number.isInteger(hour) || !Number.isInteger(minute)) {
    throw new Error(`Could not read the current time in timezone "${timeZone}".`);
  }
  return { dayOfWeek, minuteOfDay: hour * 60 + minute };
}

function buildIntervals(
  schedule: Map<BusinessDayOfWeek, BusinessHour>,
): MinuteInterval[] {
  const intervals: MinuteInterval[] = [];
  for (let weekOffset = -1; weekOffset <= 1; weekOffset += 1) {
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek += 1) {
      const entry = schedule.get(dayOfWeek as BusinessDayOfWeek);
      if (!entry) continue;
      for (const interval of entry.intervals ?? []) {
        const opensAt = parseClockTime(interval.opensAt, false);
        const closesAt = parseClockTime(interval.closesAt, true);
        const start = weekOffset * MINUTES_PER_WEEK + dayOfWeek * MINUTES_PER_DAY + opensAt;
        let end = weekOffset * MINUTES_PER_WEEK + dayOfWeek * MINUTES_PER_DAY + closesAt;
        if (end <= start) end += MINUTES_PER_DAY;
        intervals.push({ start, end });
      }
    }
  }

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

export function getLocationHoursStatus(
  hours: readonly BusinessHour[],
  options: LocationHoursOpenStatusOptions,
  now: Date,
): LocationHoursStatus {
  if (!options.timeZone.trim()) {
    throw new Error("Open status requires the business location's IANA timezone.");
  }
  const schedule = getSchedule(hours);
  const { dayOfWeek, minuteOfDay } = getLocalDateParts(now, options.timeZone);
  const nowInWeek = dayOfWeek * MINUTES_PER_DAY + minuteOfDay;
  const intervals = buildIntervals(schedule);
  const currentInterval = intervals.find(
    (interval) => interval.start <= nowInWeek && nowInWeek < interval.end,
  );

  if (currentInterval) {
    const closeDayOffset =
      Math.floor(currentInterval.end / MINUTES_PER_DAY) - dayOfWeek;
    const closesAt = formatTime(currentInterval.end, options.locale);
    const closesText = closeDayOffset > 0
      ? `${formatDayOffset(closeDayOffset, options.locale)} at ${closesAt}`
      : `at ${closesAt}`;
    return {
      state: "open",
      message: `Open now · Closes ${closesText}`,
    };
  }

  const nextOpening = intervals.find((interval) => interval.start > nowInWeek);
  if (!nextOpening) {
    return { state: "closed", message: "Closed" };
  }
  const openDayOffset =
    Math.floor(nextOpening.start / MINUTES_PER_DAY) - dayOfWeek;
  const opensAt = formatTime(nextOpening.start, options.locale);
  const opensText = openDayOffset > 0
    ? `${formatDayOffset(openDayOffset, options.locale)} at ${opensAt}`
    : `at ${opensAt}`;
  return {
    state: "closed",
    message: `Closed · Opens ${opensText}`,
  };
}
