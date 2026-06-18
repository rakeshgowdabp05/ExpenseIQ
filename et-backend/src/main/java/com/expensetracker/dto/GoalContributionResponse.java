package com.expensetracker.dto;

import com.expensetracker.entity.GoalContributionStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record GoalContributionResponse(

        String publicId,
        String goalPublicId,
        GoalAccountSummaryResponse sourceAccount,
        BigDecimal amount,
        String currencyCode,
        LocalDate contributionDate,
        String note,
        String referenceNumber,
        GoalContributionStatus status,
        Instant cancelledAt,
        Instant createdAt,
        Instant updatedAt
) {
}