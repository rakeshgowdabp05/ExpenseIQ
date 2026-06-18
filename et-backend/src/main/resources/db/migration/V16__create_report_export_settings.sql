CREATE TABLE report_export_settings (
    setting_key VARCHAR(100) NOT NULL,
    setting_value VARCHAR(255) NOT NULL,
    value_type VARCHAR(30) NOT NULL,
    description VARCHAR(255) NOT NULL,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at DATETIME(6) NOT NULL
        DEFAULT CURRENT_TIMESTAMP(6),

    updated_at DATETIME(6) NOT NULL
        DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),

    CONSTRAINT pk_report_export_settings
        PRIMARY KEY (setting_key),

    CONSTRAINT chk_report_export_settings_value_type
        CHECK (
            value_type IN (
                'INTEGER',
                'STRING'
            )
        )
) ENGINE = InnoDB;

INSERT INTO report_export_settings (
    setting_key,
    setting_value,
    value_type,
    description,
    active
)
VALUES
    (
        'REPORT_EXPORT_BRAND_NAME',
        'Expense Tracker',
        'STRING',
        'Brand name displayed in exported financial reports.',
        TRUE
    ),
    (
        'REPORT_EXPORT_WATERMARK_TEXT',
        'Expense Tracker',
        'STRING',
        'Watermark text rendered in PDF financial reports.',
        TRUE
    ),
    (
        'REPORT_EXPORT_FILE_BASENAME',
        'financial-report',
        'STRING',
        'Base file name used for exported report downloads.',
        TRUE
    ),
    (
        'REPORT_EXPORT_PDF_LINE_LIMIT',
        '60',
        'INTEGER',
        'Maximum body lines rendered in the compact PDF report.',
        TRUE
    ),
    (
        'REPORT_EXPORT_RECENT_TRANSACTION_LIMIT',
        '30',
        'INTEGER',
        'Maximum recent transactions included in report summaries.',
        TRUE
    );
