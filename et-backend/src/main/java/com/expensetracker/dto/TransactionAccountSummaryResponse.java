package com.expensetracker.dto;

import com.expensetracker.entity.AccountType;

public record TransactionAccountSummaryResponse(

        String publicId,
        String name,
        AccountType accountType,
        String currencyCode
) {
}