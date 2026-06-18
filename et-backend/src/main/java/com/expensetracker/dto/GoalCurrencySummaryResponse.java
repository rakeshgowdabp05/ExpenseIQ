package com.expensetracker.dto;

import java.math.BigDecimal;

public record GoalCurrencySummaryResponse(

        String currencyCode,
        BigDecimal totalTargetAmount,
        BigDecimal totalSavedAmount,
        BigDecimal totalRemainingAmount
) {
}