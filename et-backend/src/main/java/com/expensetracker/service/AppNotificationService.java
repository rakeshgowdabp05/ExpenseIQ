package com.expensetracker.service;

import com.expensetracker.dto.NotificationResponse;
import com.expensetracker.dto.NotificationSummaryResponse;
import com.expensetracker.entity.NotificationSeverity;
import com.expensetracker.entity.NotificationType;

import java.util.List;

public interface AppNotificationService {

    List<NotificationResponse> getNotifications(
            String authenticatedEmail,
            boolean unreadOnly,
            Integer limit
    );

    NotificationSummaryResponse getSummary(
            String authenticatedEmail
    );

    NotificationResponse markAsRead(
            String authenticatedEmail,
            String publicId
    );

    NotificationSummaryResponse markAllAsRead(
            String authenticatedEmail
    );

    void archive(
            String authenticatedEmail,
            String publicId
    );

    void createOrRefreshForUser(
            Long userId,
            NotificationType type,
            NotificationSeverity severity,
            String title,
            String message,
            String sourceType,
            String sourcePublicId,
            String actionUrl,
            String dedupeKey
    );
}
