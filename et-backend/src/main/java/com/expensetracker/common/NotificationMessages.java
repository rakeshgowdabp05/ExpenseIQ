package com.expensetracker.common;

public final class NotificationMessages {

    public static final String LIST_FETCHED =
            "Notifications fetched successfully.";

    public static final String SUMMARY_FETCHED =
            "Notification summary fetched successfully.";

    public static final String GENERATED =
            "Notifications generated successfully.";

    public static final String MARKED_READ =
            "Notification marked as read.";

    public static final String ALL_MARKED_READ =
            "All notifications marked as read.";

    public static final String ARCHIVED =
            "Notification archived successfully.";

    public static final String NOT_FOUND =
            "Notification was not found.";

    public static final String USER_NOT_FOUND =
            "Authenticated user account was not found.";

    private NotificationMessages() {
        throw new IllegalStateException(
                "NotificationMessages cannot be instantiated."
        );
    }
}
