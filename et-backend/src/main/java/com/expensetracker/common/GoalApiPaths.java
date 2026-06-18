package com.expensetracker.common;

public final class GoalApiPaths {

    public static final String BASE_PATH =
            "/api/v1/goals";

    public static final String BY_PUBLIC_ID =
            "/{publicId}";

    public static final String STATUS =
            BY_PUBLIC_ID + "/status";

    public static final String SUMMARY =
            "/summary";

    public static final String CONTRIBUTIONS =
            BY_PUBLIC_ID + "/contributions";

    public static final String CONTRIBUTION_BY_PUBLIC_ID =
            CONTRIBUTIONS + "/{contributionPublicId}";

    private GoalApiPaths() {
        throw new IllegalStateException(
                "GoalApiPaths cannot be instantiated."
        );
    }
}