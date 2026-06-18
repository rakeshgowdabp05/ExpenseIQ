package com.expensetracker.common;

public final class AccountValidationConstants {

    public static final int NAME_MIN_LENGTH = 2;
    public static final int NAME_MAX_LENGTH = 100;

    public static final int INSTITUTION_MAX_LENGTH = 150;

    public static final int CURRENCY_CODE_LENGTH = 3;

    public static final int MONEY_INTEGER_DIGITS = 17;
    public static final int MONEY_FRACTION_DIGITS = 2;

    public static final String CURRENCY_CODE_PATTERN =
            "^[A-Za-z]{3}$";

    public static final String ACCOUNT_LAST_FOUR_PATTERN =
            "^$|^[0-9]{4}$";

    private AccountValidationConstants() {
        throw new IllegalStateException(
                "AccountValidationConstants cannot be instantiated."
        );
    }
}