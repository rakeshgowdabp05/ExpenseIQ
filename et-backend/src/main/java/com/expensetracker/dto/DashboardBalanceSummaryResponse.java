package com.expensetracker.dto;

import java.math.BigDecimal;

public record DashboardBalanceSummaryResponse(

        String currencyCode,
        BigDecimal totalBalance,
        long includedAccountCount
) {
}