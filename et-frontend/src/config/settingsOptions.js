export const DATE_FORMAT_OPTIONS =
  Object.freeze([
    "DD_MM_YYYY",
    "MM_DD_YYYY",
    "YYYY_MM_DD",
  ]);

export const THEME_PREFERENCE_OPTIONS =
  Object.freeze([
    {
      value: "SYSTEM",
      label: "Use system setting",
    },
    {
      value: "LIGHT",
      label: "Light",
    },
    {
      value: "DARK",
      label: "Dark",
    },
  ]);

function getSupportedValues(type) {
  try {
    if (
      typeof Intl.supportedValuesOf !==
      "function"
    ) {
      return [];
    }

    return Intl.supportedValuesOf(type);
  } catch {
    return [];
  }
}

function sortValues(values) {
  return [...values].sort(
    (first, second) =>
      first.localeCompare(second),
  );
}

export function getCurrencyOptions(
  selectedCurrency,
) {
  const currencies = new Set(
    getSupportedValues("currency"),
  );

  if (selectedCurrency) {
    currencies.add(
      selectedCurrency
        .trim()
        .toUpperCase(),
    );
  }

  return sortValues(currencies);
}

export function getTimezoneOptions(
  selectedTimezone,
) {
  const timezones = new Set(
    getSupportedValues("timeZone"),
  );

  try {
    const browserTimezone =
      Intl.DateTimeFormat()
        .resolvedOptions()
        .timeZone;

    if (browserTimezone) {
      timezones.add(browserTimezone);
    }
  } catch {
    // The backend-selected value remains available.
  }

  if (selectedTimezone) {
    timezones.add(
      selectedTimezone.trim(),
    );
  }

  return sortValues(timezones);
}

export function formatDatePreview(
  format,
  date = new Date(),
) {
  const year = String(
    date.getFullYear(),
  );

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  if (format === "MM_DD_YYYY") {
    return `${month}-${day}-${year}`;
  }

  if (format === "YYYY_MM_DD") {
    return `${year}-${month}-${day}`;
  }

  return `${day}-${month}-${year}`;
}