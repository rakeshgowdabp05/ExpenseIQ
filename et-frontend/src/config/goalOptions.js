export const GOAL_STATUS_FILTERS =
  Object.freeze([
    {
      value: "ALL",
      label: "All goals",
    },
    {
      value: "IN_PROGRESS",
      label: "In progress",
    },
    {
      value: "PAUSED",
      label: "Paused",
    },
    {
      value: "COMPLETED",
      label: "Completed",
    },
    {
      value: "OVERDUE",
      label: "Overdue",
    },
  ]);

const GOAL_STATUS_LABELS =
  Object.freeze({
    IN_PROGRESS: "In progress",
    PAUSED: "Paused",
    COMPLETED: "Completed",
    OVERDUE: "Overdue",
    ARCHIVED: "Archived",
  });

export function getGoalStatusLabel(
  status,
) {
  return (
    GOAL_STATUS_LABELS[status] ??
    status
  );
}