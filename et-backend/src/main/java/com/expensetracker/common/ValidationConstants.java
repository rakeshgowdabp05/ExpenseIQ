package com.expensetracker.common;

public final class ValidationConstants {

    public static final int NAME_MIN_LENGTH = 2;

    public static final int NAME_MAX_LENGTH = 100;

    public static final int EMAIL_MAX_LENGTH = 255;

    public static final int PASSWORD_MIN_LENGTH = 8;

    public static final int PASSWORD_MAX_LENGTH = 72;

    public static final int PHONE_MAX_LENGTH = 20;

    public static final int REGION_CODE_MAX_LENGTH = 80;

    public static final int REGION_LABEL_MAX_LENGTH = 255;

    public static final int TIMEZONE_MAX_LENGTH = 80;

    public static final int LOCATION_SOURCE_MAX_LENGTH = 60;

    public static final int CURRENCY_CODE_LENGTH = 3;

    public static final int SESSION_PUBLIC_ID_LENGTH = 36;

    public static final String PHONE_PATTERN =
            "^[0-9+()\\-\\s]*$";

    public static final String CURRENCY_CODE_PATTERN =
            "^[A-Za-z]{3}$";

    private ValidationConstants() {
        throw new IllegalStateException(
                "ValidationConstants cannot be instantiated."
        );
    }
}