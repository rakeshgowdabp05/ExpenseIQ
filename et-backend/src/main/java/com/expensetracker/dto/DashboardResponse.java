package com.expensetracker.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record DashboardResponse(

        Instant generatedAt,

        String timezone,

        LocalDate periodStart,

        LocalDate periodEnd,

        long totalAccountCount,

        long activeAccountCount,

        List<DashboardBalanceSummaryResponse>
                balancesByCurrency,

        List<DashboardCashFlowSummaryResponse>
                currentMonthCashFlow,

        DashboardTransactionCountResponse
                transactionCounts,

        DashboardBudgetOverviewResponse
                budgetOverview,

        DashboardGoalOverviewResponse
                goalOverview,

        List<TransactionResponse>
                recentTransactions
) {
}