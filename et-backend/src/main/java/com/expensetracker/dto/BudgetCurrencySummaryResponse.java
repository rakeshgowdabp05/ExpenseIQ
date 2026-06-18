package com.expensetracker.dto;

import java.math.BigDecimal;

public record BudgetCurrencySummaryResponse(

        String currencyCode,

        BigDecimal overallBudgetLimit,

        BigDecimal overallBudgetSpent,

        BigDecimal categoryBudgetLimit,

        BigDecimal categoryBudgetSpent
) {
}