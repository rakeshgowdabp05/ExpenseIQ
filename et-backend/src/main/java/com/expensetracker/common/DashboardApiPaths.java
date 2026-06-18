package com.expensetracker.common;

public final class DashboardApiPaths {

    public static final String BASE_PATH =
            "/api/v1/dashboard";

    private DashboardApiPaths() {
        throw new IllegalStateException(
                "DashboardApiPaths cannot be instantiated."
        );
    }
}