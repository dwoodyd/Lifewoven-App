const LIFEWOVEN_TIME_ZONE = "America/Los_Angeles";

/** Render all member-facing dates on one explicit Pacific clock. */
export function formatLifewovenDate(value: Date | string | number, options: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: LIFEWOVEN_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  }).format(new Date(value));
}

export function formatLifewovenToday(options: Intl.DateTimeFormatOptions = {}) {
  return formatLifewovenDate(new Date(), options);
}
