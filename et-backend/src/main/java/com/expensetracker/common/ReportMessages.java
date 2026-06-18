package com.expensetracker.common;

public final class ReportMessages {

    public static final String SUMMARY_FETCHED =
            "Financial report fetched successfully.";

    public static final String DATE_RANGE_PAIR_REQUIRED =
            "Report from date and to date must be provided together.";

    public static final String DATE_RANGE_INVALID =
            "Report from date must not be after the to date.";

    public static final String FUTURE_DATE_NOT_ALLOWED =
            "Report to date cannot be in the future.";

    private ReportMessages() {
        throw new IllegalStateException(
                "ReportMessages cannot be instantiated."
        );
    }
}
