package com.expensetracker.dto;

import com.expensetracker.entity.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionSuggestionResponse(

        TransactionType transactionType,

        String merchantName,

        String description,

        BigDecimal suggestedAmount,

        String currencyCode,

        String accountPublicId,

        String accountName,

        String categoryPublicId,

        String categoryName,

        long usageCount,

        LocalDate lastUsedDate
) {
}