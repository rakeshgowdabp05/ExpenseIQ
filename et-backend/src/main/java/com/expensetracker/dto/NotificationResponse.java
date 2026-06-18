package com.expensetracker.dto;

import com.expensetracker.entity.NotificationSeverity;
import com.expensetracker.entity.NotificationType;

import java.time.Instant;

public record NotificationResponse(

        String publicId,
        NotificationType notificationType,
        NotificationSeverity severity,
        String title,
        String message,
        String sourceType,
        String sourcePublicId,
        String actionUrl,
        boolean read,
        Instant readAt,
        Instant createdAt,
        Instant updatedAt
) {
}
