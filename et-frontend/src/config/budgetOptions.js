export const DEFAULT_BUDGET_WARNING_THRESHOLD = 80;

export const BUDGET_WARNING_THRESHOLD_MIN = 1;

export const BUDGET_WARNING_THRESHOLD_MAX = 100;

export const BUDGET_PERIOD_OPTIONS = Object.freeze([
  {
    value: "MONTHLY",
    label: "Monthly",
    description:
      "Covers one complete calendar month.",
  },
  {
    value: "CUSTOM",
    label: "Custom period",
    description:
      "Uses a specific start and end date.",
  },
]);

export const BUDGET_STATUS_FILTERS = Object.freeze([
  {
    value: "ALL",
    label: "All budgets",
  },
  {
    value: "ACTIVE",
    label: "Active",
  },
  {
    value: "INACTIVE",
    label: "Inactive",
  },
]);

const BUDGET_STATUS_LABELS = Object.freeze({
  ON_TRACK: "On track",
  WARNING: "Warning",
  EXCEEDED: "Exceeded",
  INACTIVE: "Inactive",
});

export function getBudgetStatusLabel(status) {
  return BUDGET_STATUS_LABELS[status] ?? status;
}