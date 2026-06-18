package com.expensetracker.common;

public final class CategoryValidationMessages {

    public static final String NAME_REQUIRED =
            "Category name is required.";

    public static final String NAME_LENGTH =
            "Category name must contain between 2 and 80 characters.";

    public static final String TYPE_REQUIRED =
            "Category type is required.";

    public static final String ICON_REQUIRED =
            "Category icon is required.";

    public static final String COLOR_REQUIRED =
            "Category color is required.";

    public static final String ACTIVE_REQUIRED =
            "Category status is required.";

    private CategoryValidationMessages() {
        throw new IllegalStateException(
                "CategoryValidationMessages cannot be instantiated."
        );
    }
}