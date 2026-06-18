package com.expensetracker.common;

public final class AccountValidationMessages {

    public static final String NAME_REQUIRED =
            "Account name is required.";

    public static final String NAME_LENGTH =
            "Account name must contain between 2 and 100 characters.";

    public static final String TYPE_REQUIRED =
            "Account type is required.";

    public static final String CURRENCY_REQUIRED =
            "Currency code is required.";

    public static final String CURRENCY_INVALID =
            "Currency code must contain exactly three letters.";

    public static final String OPENING_BALANCE_REQUIRED =
            "Opening balance is required.";

    public static final String OPENING_BALANCE_INVALID =
            "Opening balance supports up to 17 whole digits and 2 decimal places.";

    public static final String INSTITUTION_LENGTH =
            "Institution name must not exceed 150 characters.";

    public static final String LAST_FOUR_INVALID =
            "Account number must contain only the final four digits.";

    public static final String INCLUDE_IN_TOTAL_REQUIRED =
            "Include-in-total selection is required.";

    public static final String ACTIVE_STATUS_REQUIRED =
            "Account status is required.";

    private AccountValidationMessages() {
        throw new IllegalStateException(
                "AccountValidationMessages cannot be instantiated."
        );
    }
}