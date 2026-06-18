package com.expensetracker.dto;

import com.expensetracker.entity.BudgetPeriodType;
import com.expensetracker.entity.BudgetStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record BudgetResponse(

        String publicId,

        String name,

        String categoryPublicId,

        String categoryName,

        boolean overallBudget,

        BigDecimal limitAmount,

        BigDecimal spentAmount,

        BigDecimal remainingAmount,

        BigDecimal percentageUsed,

        String currencyCode,

        BudgetPeriodType periodType,

        LocalDate startDate,

        LocalDate endDate,

        int warningThreshold,

        BudgetStatus status,

        boolean active,

        Instant createdAt,

        Instant updatedAt
) {
}