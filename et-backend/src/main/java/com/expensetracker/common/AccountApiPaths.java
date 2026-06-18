package com.expensetracker.common;

public final class AccountApiPaths {

    public static final String BASE_PATH =
            "/api/v1/accounts";

    public static final String BY_PUBLIC_ID =
            "/{publicId}";

    public static final String STATUS =
            BY_PUBLIC_ID + "/status";

    private AccountApiPaths() {
        throw new IllegalStateException(
                "AccountApiPaths cannot be instantiated."
        );
    }
}