package com.expensetracker.dto;

import java.time.LocalDate;
import java.util.List;

public record BudgetSummaryResponse(

        LocalDate periodStart,

        LocalDate periodEnd,

        int totalBudgetCount,

        int onTrackCount,

        int warningCount,

        int exceededCount,

        int inactiveCount,

        List<BudgetCurrencySummaryResponse> currencies
) {
}