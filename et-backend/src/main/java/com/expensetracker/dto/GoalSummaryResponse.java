package com.expensetracker.dto;

import java.util.List;

public record GoalSummaryResponse(

        int totalGoalCount,
        int inProgressCount,
        int pausedCount,
        int completedCount,
        int overdueCount,

        List<GoalCurrencySummaryResponse> currencies
) {
}