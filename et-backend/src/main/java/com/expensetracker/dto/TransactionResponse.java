package com.expensetracker.dto;

import com.expensetracker.entity.TransactionStatus;
import com.expensetracker.entity.TransactionType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record TransactionResponse(

        String publicId,
        TransactionType transactionType,
        TransactionStatus transactionStatus,
        TransactionAccountSummaryResponse account,
        TransactionAccountSummaryResponse destinationAccount,
        TransactionCategorySummaryResponse category,
        BigDecimal amount,
        String currencyCode,
        LocalDate transactionDate,
        String merchantName,
        String description,
        String referenceNumber,
        TransactionReceiptResponse receipt,
        Instant cancelledAt,
        Instant createdAt,
        Instant updatedAt
) {
}
