package com.expensetracker.common;

public final class NotificationValidationConstants {

    public static final int DEFAULT_LIST_LIMIT = 20;
    public static final int MAX_LIST_LIMIT = 100;

    public static final int TITLE_MAX_LENGTH = 160;
    public static final int MESSAGE_MAX_LENGTH = 1000;
    public static final int SOURCE_TYPE_MAX_LENGTH = 50;
    public static final int ACTION_URL_MAX_LENGTH = 255;
    public static final int DEDUPE_KEY_MAX_LENGTH = 255;

    private NotificationValidationConstants() {
        throw new IllegalStateException(
                "NotificationValidationConstants cannot be instantiated."
        );
    }
}
