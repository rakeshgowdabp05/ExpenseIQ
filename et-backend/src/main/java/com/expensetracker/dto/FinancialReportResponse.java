package com.expensetracker.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record FinancialReportResponse(

        Instant generatedAt,

        String timezone,

        LocalDate fromDate,

        LocalDate toDate,

        List<CurrencyReport> currencies
) {

    public record CurrencyReport(

            String currencyCode,

            ReportTotals totals,

            List<CategoryReportRow> categoryExpenses,

            List<BudgetReportRow> budgets,

            List<GoalReportRow> goals,

            List<TransactionReportRow> recentTransactions
    ) {
    }

    public record ReportTotals(

            BigDecimal income,

            BigDecimal expense,

            BigDecimal netCashFlow,

            BigDecimal transferVolume,

            long transactionCount,

            long incomeTransactionCount,

            long expenseTransactionCount,

            long transferTransactionCount
    ) {
    }

    public record CategoryReportRow(

            String categoryPublicId,

            String categoryName,

            BigDecimal amount,

            long transactionCount,

            BigDecimal percentageOfExpense
    ) {
    }

    public record BudgetReportRow(

            String budgetPublicId,

            String budgetName,

            BigDecimal limitAmount,

            BigDecimal spentAmount,

            BigDecimal remainingAmount,

            BigDecimal usagePercentage,

            String status
    ) {
    }

    public record GoalReportRow(

            String goalPublicId,

            String goalName,

            BigDecimal targetAmount,

            BigDecimal currentAmount,

            BigDecimal remainingAmount,

            BigDecimal progressPercentage,

            String status,

            LocalDate targetDate
    ) {
    }

    public record TransactionReportRow(

            String transactionPublicId,

            String transactionType,

            LocalDate transactionDate,

            String accountName,

            String categoryName,

            BigDecimal amount,

            String merchantName,

            String description
    ) {
    }
}
