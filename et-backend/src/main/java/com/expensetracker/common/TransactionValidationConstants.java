package com.expensetracker.common;

public final class TransactionValidationConstants {

    public static final int MONEY_INTEGER_DIGITS = 17;
    public static final int MONEY_FRACTION_DIGITS = 2;

    public static final int MERCHANT_MAX_LENGTH = 120;
    public static final int DESCRIPTION_MAX_LENGTH = 255;
    public static final int REFERENCE_MAX_LENGTH = 100;

    public static final int DEFAULT_PAGE_NUMBER = 0;
    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;

    public static final String DEFAULT_PAGE_NUMBER_VALUE = "0";
    public static final String DEFAULT_PAGE_SIZE_VALUE = "20";

    public static final int MONEY_SCALE = 2;

    private TransactionValidationConstants() {
        throw new IllegalStateException(
                "TransactionValidationConstants cannot be instantiated."
        );
    }
}