package com.expensetracker.dto;

import com.expensetracker.entity.AccountType;

public record GoalAccountSummaryResponse(

        String publicId,
        String name,
        AccountType accountType,
        String currencyCode
) {
}