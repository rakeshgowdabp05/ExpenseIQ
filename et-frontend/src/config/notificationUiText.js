export const notificationUiText = Object.freeze({
  title:
    "Notifications",

  unread:
    "Unread",

  emptyTitle:
    "You're all caught up",
  emptyMessage:
    "New finance alerts will appear here.",

  buttons: Object.freeze({
    open:
      "Open notifications",
    close:
      "Close notifications",
    refreshList:
      "Refresh list",
    refreshAlerts:
      "Generate latest alerts",
    markAllRead:
      "Mark all as read",
    archive:
      "Archive notification",
  }),

  errors: Object.freeze({
    loadFailed:
      "Unable to load notifications.",
    refreshFailed:
      "Unable to refresh notification alerts.",
    markReadFailed:
      "Unable to mark notification as read.",
    markAllReadFailed:
      "Unable to mark all notifications as read.",
    archiveFailed:
      "Unable to archive notification.",
  }),
});
