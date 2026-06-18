package com.expensetracker.dto;

public record NotificationSummaryResponse(

        long totalCount,
        long unreadCount
) {
}
