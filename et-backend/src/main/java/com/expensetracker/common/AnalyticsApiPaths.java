package com.expensetracker.common;

public final class AnalyticsApiPaths {

    public static final String BASE_PATH =
            "/api/v1/analytics";

    private AnalyticsApiPaths() {
        throw new IllegalStateException(
                "AnalyticsApiPaths cannot be instantiated."
        );
    }
}