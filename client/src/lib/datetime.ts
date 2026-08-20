const LIFEWOVEN_TIME_ZONE = "America/Los_Angeles";

function toUtcDate(value: Date | string | number) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
    return new Date(`${value.replace(" ", "T")}Z`);
  }
  return new Date(value);
}

/** Render all member-facing dates on one explicit Pacific clock. */
export function formatLifewovenDate(value: Date | string | number, options: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: LIFEWOVEN_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  }).format(toUtcDate(value));
}

export function formatLifewovenToday(options: Intl.DateTimeFormatOptions = {}) {
  return formatLifewovenDate(new Date(), options);
}
