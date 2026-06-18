package com.expensetracker.entity;

public enum NotificationAlertSettingKey {

    GOAL_DEADLINE_DAYS(
            "NOTIFICATION_GOAL_DEADLINE_DAYS"
    ),

    LARGE_EXPENSE_THRESHOLD(
            "NOTIFICATION_LARGE_EXPENSE_THRESHOLD"
    );

    private final String databaseKey;

    NotificationAlertSettingKey(
            String databaseKey
    ) {
        this.databaseKey =
                databaseKey;
    }

    public String databaseKey() {
        return databaseKey;
    }
}
