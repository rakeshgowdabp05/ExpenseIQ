package com.expensetracker.dto;

import com.expensetracker.entity.NotificationSeverity;
import com.expensetracker.entity.NotificationType;

public record NotificationTemplateRecord(

        String code,
        NotificationType notificationType,
        NotificationSeverity severity,
        String titleTemplate,
        String messageTemplate,
        String sourceType,
        String actionUrl
) {
}
