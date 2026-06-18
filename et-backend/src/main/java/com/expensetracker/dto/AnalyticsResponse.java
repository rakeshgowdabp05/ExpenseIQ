package com.expensetracker.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record AnalyticsResponse(

        Instant generatedAt,

        String timezone,

        LocalDate fromDate,

        LocalDate toDate,

        LocalDate previousFromDate,

        LocalDate previousToDate,

        List<CurrencyOverview> currencies
) {

    public record CurrencyOverview(

            String currencyCode,

            PeriodTotals currentPeriod,

            PeriodTotals previousPeriod,

            Comparison comparison,

            List<MonthlyPoint> monthlyTrend,

            List<CategoryBreakdown> expenseByCategory,

            List<AccountBreakdown> expenseByAccount,

            List<WeekdayBreakdown> expenseByWeekday
    ) {
    }

    public record PeriodTotals(

            BigDecimal income,

            BigDecimal expense,

            BigDecimal netCashFlow,

            BigDecimal transferVolume,

            BigDecimal averageExpense,

            long totalTransactionCount,

            long incomeTransactionCount,

            long expenseTransactionCount,

            long transferTransactionCount
    ) {
    }

    public record Comparison(

            BigDecimal incomeChangePercentage,

            BigDecimal expenseChangePercentage,

            BigDecimal transferChangePercentage,

            BigDecimal netCashFlowChange,

            BigDecimal savingsRate,

            BigDecimal previousSavingsRate
    ) {
    }

    public record MonthlyPoint(

            String yearMonth,

            LocalDate periodStart,

            LocalDate periodEnd,

            BigDecimal income,

            BigDecimal expense,

            BigDecimal netCashFlow,

            BigDecimal transferVolume,

            long transactionCount
    ) {
    }

    public record CategoryBreakdown(

            String categoryPublicId,

            String categoryName,

            String iconKey,

            String colorKey,

            BigDecimal amount,

            long transactionCount,

            BigDecimal percentageOfExpense
    ) {
    }

    public record AccountBreakdown(

            String accountPublicId,

            String accountName,

            String accountType,

            BigDecimal amount,

            long transactionCount,

            BigDecimal percentageOfExpense
    ) {
    }

    public record WeekdayBreakdown(

            int weekdayIndex,

            String weekday,

            BigDecimal amount,

            long transactionCount,

            BigDecimal percentageOfExpense
    ) {
    }
}