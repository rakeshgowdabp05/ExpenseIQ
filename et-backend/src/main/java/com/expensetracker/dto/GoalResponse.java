package com.expensetracker.dto;

import com.expensetracker.entity.GoalStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record GoalResponse(

        String publicId,
        String name,
        String description,

        BigDecimal targetAmount,
        BigDecimal currentAmount,
        BigDecimal remainingAmount,
        BigDecimal progressPercentage,

        String currencyCode,
        LocalDate targetDate,
        long daysRemaining,

        GoalStatus status,
        boolean overdue,

        Instant completedAt,
        Instant createdAt,
        Instant updatedAt
) {
}