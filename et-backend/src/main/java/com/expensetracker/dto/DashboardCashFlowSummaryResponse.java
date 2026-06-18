package com.expensetracker.dto;

import java.math.BigDecimal;

public record DashboardCashFlowSummaryResponse(

        String currencyCode,
        BigDecimal income,
        BigDecimal expense,
        BigDecimal netCashFlow,
        BigDecimal transferVolume,
        long postedTransactionCount
) {
}