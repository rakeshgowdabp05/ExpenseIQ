package com.expensetracker.common;

public final class CategoryValidationConstants {

    public static final int NAME_MIN_LENGTH = 2;
    public static final int NAME_MAX_LENGTH = 80;

    private CategoryValidationConstants() {
        throw new IllegalStateException(
                "CategoryValidationConstants cannot be instantiated."
        );
    }
}