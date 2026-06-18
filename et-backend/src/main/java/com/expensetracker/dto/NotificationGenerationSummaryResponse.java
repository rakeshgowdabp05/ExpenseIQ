package com.expensetracker.dto;

public record NotificationGenerationSummaryResponse(

        int totalGenerated,
        int budgetWarningCount,
        int budgetExceededCount,
        int goalDeadlineCount,
        int largeExpenseCount,
        int monthlySummaryCount
) {
}
