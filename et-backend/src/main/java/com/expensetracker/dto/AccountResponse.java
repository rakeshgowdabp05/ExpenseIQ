package com.expensetracker.dto;

import com.expensetracker.entity.AccountType;

import java.math.BigDecimal;
import java.time.Instant;

public record AccountResponse(

        String publicId,
        String name,
        AccountType accountType,
        String currencyCode,
        BigDecimal openingBalance,
        BigDecimal currentBalance,
        String institutionName,
        String accountNumberLastFour,
        boolean includeInTotal,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
}