package com.expensetracker.dto;

public record DashboardTransactionCountResponse(

        long posted,
        long cancelled,
        long total
) {
}