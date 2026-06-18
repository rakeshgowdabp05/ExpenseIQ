package com.expensetracker.common;

public final class TransactionValidationMessages {

    public static final String TYPE_REQUIRED =
            "Transaction type is required.";

    public static final String ACCOUNT_REQUIRED =
            "Account public ID is required.";

    public static final String AMOUNT_REQUIRED =
            "Transaction amount is required.";

    public static final String AMOUNT_POSITIVE =
            "Transaction amount must be greater than zero.";

    public static final String AMOUNT_INVALID =
            "Transaction amount supports up to 17 whole digits and 2 decimal places.";

    public static final String DATE_REQUIRED =
            "Transaction date is required.";

    public static final String DATE_FUTURE_NOT_ALLOWED =
            "Posted transactions cannot use a future date.";

    public static final String MERCHANT_TOO_LONG =
            "Merchant name must not exceed 120 characters.";

    public static final String DESCRIPTION_TOO_LONG =
            "Description must not exceed 255 characters.";

    public static final String REFERENCE_TOO_LONG =
            "Reference number must not exceed 100 characters.";

    private TransactionValidationMessages() {
        throw new IllegalStateException(
                "TransactionValidationMessages cannot be instantiated."
        );
    }
}