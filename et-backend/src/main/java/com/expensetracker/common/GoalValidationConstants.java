package com.expensetracker.common;

public final class GoalValidationConstants {

    public static final int NAME_MIN_LENGTH = 2;
    public static final int NAME_MAX_LENGTH = 120;

    public static final int DESCRIPTION_MAX_LENGTH = 500;
    public static final int NOTE_MAX_LENGTH = 255;
    public static final int REFERENCE_MAX_LENGTH = 100;

    public static final int MONEY_INTEGER_DIGITS = 17;
    public static final int MONEY_FRACTION_DIGITS = 2;
    public static final int MONEY_SCALE = 2;

    public static final int CURRENCY_CODE_LENGTH = 3;

    public static final String MINIMUM_AMOUNT =
            "0.01";

    public static final String CURRENCY_PATTERN =
            "^[A-Z]{3}$";

    private GoalValidationConstants() {
        throw new IllegalStateException(
                "GoalValidationConstants cannot be instantiated."
        );
    }
}