package com.expensetracker.common;

public final class BudgetValidationConstants {

    public static final int NAME_MAX_LENGTH =
            120;

    public static final int CURRENCY_LENGTH =
            3;

    public static final int WARNING_THRESHOLD_MIN =
            1;

    public static final int WARNING_THRESHOLD_MAX =
            100;

    public static final int DEFAULT_WARNING_THRESHOLD =
            80;

    public static final String MINIMUM_LIMIT_AMOUNT =
            "0.01";

    public static final String CURRENCY_PATTERN =
            "^[A-Z]{3}$";

    public static final String MONTH_PATTERN =
            "^\\d{4}-(0[1-9]|1[0-2])$";

    private BudgetValidationConstants() {
        throw new IllegalStateException(
                "Utility class"
        );
    }
}