package com.expensetracker.common;

public final class CategoryApiPaths {

    public static final String BASE_PATH =
            "/api/v1/categories";

    public static final String BY_PUBLIC_ID =
            "/{publicId}";

    public static final String STATUS =
            BY_PUBLIC_ID + "/status";

    private CategoryApiPaths() {
        throw new IllegalStateException(
                "CategoryApiPaths cannot be instantiated."
        );
    }
}