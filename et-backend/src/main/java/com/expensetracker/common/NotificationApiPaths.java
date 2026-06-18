package com.expensetracker.common;

public final class NotificationApiPaths {

    public static final String BASE_PATH =
            "/api/v1/notifications";

    public static final String BY_PUBLIC_ID =
            "/{publicId}";

    public static final String READ =
            BY_PUBLIC_ID + "/read";

    public static final String READ_ALL =
            "/read-all";

    public static final String SUMMARY =
            "/summary";

    public static final String GENERATE =
            "/generate";

    private NotificationApiPaths() {
        throw new IllegalStateException(
                "NotificationApiPaths cannot be instantiated."
        );
    }
}
