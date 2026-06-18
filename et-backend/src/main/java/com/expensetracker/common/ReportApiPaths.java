package com.expensetracker.common;

public final class ReportApiPaths {

    public static final String BASE_PATH =
            "/api/v1/reports";

    public static final String SUMMARY =
            "/summary";

    public static final String EXPORT_CSV =
            "/exports/csv";

    public static final String EXPORT_PDF =
            "/exports/pdf";

    public static final String EXPORT_XLSX =
            "/exports/xlsx";

    private ReportApiPaths() {
        throw new IllegalStateException(
                "ReportApiPaths cannot be instantiated."
        );
    }
}
