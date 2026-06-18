package com.expensetracker.entity;

public enum ReportExportSettingKey {

    BRAND_NAME(
            "REPORT_EXPORT_BRAND_NAME"
    ),

    WATERMARK_TEXT(
            "REPORT_EXPORT_WATERMARK_TEXT"
    ),

    FILE_BASENAME(
            "REPORT_EXPORT_FILE_BASENAME"
    ),

    PDF_LINE_LIMIT(
            "REPORT_EXPORT_PDF_LINE_LIMIT"
    ),

    RECENT_TRANSACTION_LIMIT(
            "REPORT_EXPORT_RECENT_TRANSACTION_LIMIT"
    );

    private final String databaseKey;

    ReportExportSettingKey(
            String databaseKey
    ) {
        this.databaseKey =
                databaseKey;
    }

    public String databaseKey() {
        return databaseKey;
    }
}
