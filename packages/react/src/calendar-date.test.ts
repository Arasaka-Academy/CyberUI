import { describe, expect, it } from "vitest";
import { addCalendarDays, addCalendarMonths, calendarDate, calendarDays, clampCalendarDate, parseCalendarDate, validCalendarValue } from "./calendar-date";

describe("local calendar dates", () => {
  it("rejects normalized impossible dates and accepts Gregorian leap years", () => {
    for (const value of ["2025-02-29", "1900-02-29", "2026-04-31", "0000-01-01", "2026-13-01", "2026-1-01"]) expect(parseCalendarDate(value)).toBeNull();
    for (const value of ["2000-02-29", "2024-02-29", "0099-01-01", "0001-01-01", "9999-12-31"]) expect(calendarDate(parseCalendarDate(value)!)).toBe(value);
  });
  it("clamps month navigation to the last day and crosses year boundaries", () => {
    expect(addCalendarMonths("2024-01-31", 1)).toBe("2024-02-29");
    expect(addCalendarMonths("2024-02-29", 12)).toBe("2025-02-28");
    expect(addCalendarMonths("2026-01-31", -1)).toBe("2025-12-31");
    expect(addCalendarMonths("0001-01-01", -1)).toBe("0001-01-01");
  });
  it("moves by local days through DST and constructs six complete calendar weeks", () => {
    expect(addCalendarDays("2026-03-08", 1)).toBe("2026-03-09");
    expect(addCalendarDays("2026-11-01", -1)).toBe("2026-10-31");
    const days = calendarDays("2026-11-11");
    expect(days).toHaveLength(42);
    expect(days[0]).toBe("2026-11-01");
    expect(days.at(-1)).toBe("2026-12-12");
  });
  it("keeps min/max and local date-time validation without UTC conversion", () => {
    expect(clampCalendarDate("2026-11-11", "2026-11-12", "2026-11-20")).toBe("2026-11-12");
    expect(validCalendarValue("2024-02-29T23:59", true)).toBe(true);
    expect(validCalendarValue("2024-02-29T24:00", true)).toBe(false);
    expect(validCalendarValue("2025-02-29T12:00", true)).toBe(false);
    expect(validCalendarValue("2026-11-11", false, "2026-11-12")).toBe(false);
    expect(validCalendarValue("2026-11-11T08:00", true, "2026-11-11T09:00")).toBe(false);
  });
});
