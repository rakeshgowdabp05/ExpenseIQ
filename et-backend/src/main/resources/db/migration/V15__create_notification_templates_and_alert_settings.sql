CREATE TABLE notification_templates (
    code VARCHAR(80) NOT NULL,

    notification_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,

    title_template VARCHAR(160) NOT NULL,
    message_template VARCHAR(1000) NOT NULL,

    source_type VARCHAR(50) NOT NULL,
    action_url VARCHAR(255) NOT NULL,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at DATETIME(6) NOT NULL
        DEFAULT CURRENT_TIMESTAMP(6),

    updated_at DATETIME(6) NOT NULL
        DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),

    CONSTRAINT pk_notification_templates
        PRIMARY KEY (code),

    CONSTRAINT chk_notification_templates_type
        CHECK (
            notification_type IN (
                'BUDGET_WARNING',
                'BUDGET_EXCEEDED',
                'GOAL_DEADLINE',
                'LARGE_EXPENSE',
                'MONTHLY_SUMMARY',
                'SYSTEM'
            )
        ),

    CONSTRAINT chk_notification_templates_severity
        CHECK (
            severity IN (
                'INFO',
                'SUCCESS',
                'WARNING',
                'DANGER'
            )
        )
) ENGINE = InnoDB;

CREATE INDEX idx_notification_templates_type_active
    ON notification_templates (
        notification_type,
        active
    );

CREATE TABLE notification_alert_settings (
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

    CONSTRAINT pk_notification_alert_settings
        PRIMARY KEY (setting_key),

    CONSTRAINT chk_notification_alert_settings_value_type
        CHECK (
            value_type IN (
                'INTEGER',
                'DECIMAL',
                'STRING'
            )
        )
) ENGINE = InnoDB;

INSERT INTO notification_templates (
    code,
    notification_type,
    severity,
    title_template,
    message_template,
    source_type,
    action_url,
    active
)
VALUES
    (
        'BUDGET_WARNING_DEFAULT',
        'BUDGET_WARNING',
        'WARNING',
        'Budget nearing limit',
        '{budgetName} has used {percentageUsed} of {limitAmount}.',
        'BUDGET',
        '/app/budgets',
        TRUE
    ),
    (
        'BUDGET_EXCEEDED_DEFAULT',
        'BUDGET_EXCEEDED',
        'DANGER',
        'Budget exceeded',
        '{budgetName} has crossed its limit. Spent {spentAmount} against {limitAmount}.',
        'BUDGET',
        '/app/budgets',
        TRUE
    ),
    (
        'GOAL_DEADLINE_DEFAULT',
        'GOAL_DEADLINE',
        'WARNING',
        'Goal deadline approaching',
        '{goalName} is due on {targetDate}. Remaining amount: {remainingAmount}.',
        'GOAL',
        '/app/goals',
        TRUE
    ),
    (
        'LARGE_EXPENSE_DEFAULT',
        'LARGE_EXPENSE',
        'DANGER',
        'Large expense recorded',
        'Expense of {amount} was recorded on {transactionDate}.',
        'TRANSACTION',
        '/app/transactions',
        TRUE
    ),
    (
        'MONTHLY_SUMMARY_DEFAULT',
        'MONTHLY_SUMMARY',
        'INFO',
        'Monthly summary ready',
        '{month} summary: income {incomeAmount}, expenses {expenseAmount}.',
        'MONTHLY_SUMMARY',
        '/app/analytics',
        TRUE
    );

INSERT INTO notification_alert_settings (
    setting_key,
    setting_value,
    value_type,
    description,
    active
)
VALUES
    (
        'NOTIFICATION_GOAL_DEADLINE_DAYS',
        '30',
        'INTEGER',
        'Number of days before a savings goal target date to create a reminder.',
        TRUE
    ),
    (
        'NOTIFICATION_LARGE_EXPENSE_THRESHOLD',
        '100.00',
        'DECIMAL',
        'Minimum expense amount that should create a large-expense alert.',
        TRUE
    );
