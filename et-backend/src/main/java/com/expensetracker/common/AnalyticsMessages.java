package com.expensetracker.common;

public final class AnalyticsMessages {

    public static final String FETCH_SUCCESS =
            "Financial analytics fetched successfully.";

    public static final String DATE_RANGE_PAIR_REQUIRED =
            "From date and to date must be provided together.";

    public static final String DATE_RANGE_INVALID =
            "Analytics from date must not be after the to date.";

    public static final String FUTURE_DATE_NOT_ALLOWED =
            "Analytics to date cannot be in the future.";

    public static final String DATE_RANGE_TOO_LARGE =
            "Analytics date range must not exceed %d days.";

    private AnalyticsMessages() {
        throw new IllegalStateException(
                "AnalyticsMessages cannot be instantiated."
        );
    }
}