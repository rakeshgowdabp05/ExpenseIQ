package com.expensetracker.mapper;

import com.expensetracker.dto.NotificationResponse;
import com.expensetracker.entity.AppNotification;
import org.springframework.stereotype.Component;

@Component
public class AppNotificationMapper {

    public NotificationResponse toResponse(
            AppNotification notification
    ) {
        return new NotificationResponse(
                notification.getPublicId(),
                notification.getNotificationType(),
                notification.getSeverity(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getSourceType(),
                notification.getSourcePublicId(),
                notification.getActionUrl(),
                notification.getReadAt() != null,
                notification.getReadAt(),
                notification.getCreatedAt(),
                notification.getUpdatedAt()
        );
    }
}
