package com.expensetracker.common;

public final class BudgetApiPaths {

    public static final String ROOT =
            "/api/v1/budgets";

    public static final String BY_PUBLIC_ID =
            "/{publicId}";

    public static final String STATUS =
            "/{publicId}/status";

    public static final String SUMMARY =
            "/summary";

    private BudgetApiPaths() {
        throw new IllegalStateException(
                "Utility class"
        );
    }
}