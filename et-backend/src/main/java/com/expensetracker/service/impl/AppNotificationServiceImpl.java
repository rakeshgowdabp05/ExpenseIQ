package com.expensetracker.service.impl;

import com.expensetracker.common.ApplicationMessages;
import com.expensetracker.common.NotificationMessages;
import com.expensetracker.common.NotificationValidationConstants;
import com.expensetracker.dto.NotificationResponse;
import com.expensetracker.dto.NotificationSummaryResponse;
import com.expensetracker.entity.AppNotification;
import com.expensetracker.entity.NotificationSeverity;
import com.expensetracker.entity.NotificationType;
import com.expensetracker.entity.User;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.mapper.AppNotificationMapper;
import com.expensetracker.repository.AppNotificationRepository;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.service.AppNotificationService;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.List;

@Service
public class AppNotificationServiceImpl
        implements AppNotificationService {

    private final AppNotificationRepository
            notificationRepository;

    private final UserRepository userRepository;

    private final AppNotificationMapper mapper;

    private final Clock clock;

    public AppNotificationServiceImpl(
            AppNotificationRepository notificationRepository,
            UserRepository userRepository,
            AppNotificationMapper mapper,
            Clock clock
    ) {
        this.notificationRepository =
                notificationRepository;

        this.userRepository =
                userRepository;

        this.mapper =
                mapper;

        this.clock =
                clock;
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotifications(
            String authenticatedEmail,
            boolean unreadOnly,
            Integer limit
    ) {
        User user =
                getAuthenticatedUser(
                        authenticatedEmail
                );

        int resolvedLimit =
                resolveLimit(limit);

        return notificationRepository
                .findVisible(
                        user.getId(),
                        unreadOnly,
                        PageRequest.of(
                                0,
                                resolvedLimit
                        )
                )
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationSummaryResponse getSummary(
            String authenticatedEmail
    ) {
        User user =
                getAuthenticatedUser(
                        authenticatedEmail
                );

        return buildSummary(
                user.getId()
        );
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(
            String authenticatedEmail,
            String publicId
    ) {
        User user =
                getAuthenticatedUser(
                        authenticatedEmail
                );

        AppNotification notification =
                getNotificationForUpdate(
                        user.getId(),
                        publicId
                );

        if (
                notification.getReadAt()
                        == null
        ) {
            notification.setReadAt(
                    clock.instant()
            );
        }

        return mapper.toResponse(
                notificationRepository
                        .saveAndFlush(
                                notification
                        )
        );
    }

    @Override
    @Transactional
    public NotificationSummaryResponse markAllAsRead(
            String authenticatedEmail
    ) {
        User user =
                getAuthenticatedUser(
                        authenticatedEmail
                );

        List<AppNotification> notifications =
                notificationRepository
                        .findUnreadVisible(
                                user.getId()
                        );

        for (AppNotification notification : notifications) {
            notification.setReadAt(
                    clock.instant()
            );
        }

        notificationRepository.saveAll(
                notifications
        );

        return buildSummary(
                user.getId()
        );
    }

    @Override
    @Transactional
    public void archive(
            String authenticatedEmail,
            String publicId
    ) {
        User user =
                getAuthenticatedUser(
                        authenticatedEmail
                );

        AppNotification notification =
                getNotificationForUpdate(
                        user.getId(),
                        publicId
                );

        notification.setArchivedAt(
                clock.instant()
        );

        notificationRepository.saveAndFlush(
                notification
        );
    }

    @Override
    @Transactional
    public void createOrRefreshForUser(
            Long userId,
            NotificationType type,
            NotificationSeverity severity,
            String title,
            String message,
            String sourceType,
            String sourcePublicId,
            String actionUrl,
            String dedupeKey
    ) {
        User user =
                userRepository
                        .findById(userId)
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                ApplicationMessages
                                                        .USER_ACCOUNT_NOT_FOUND
                                        )
                        );

        AppNotification notification =
                notificationRepository
                        .findByUserIdAndDedupeKeyAndArchivedAtIsNull(
                                userId,
                                dedupeKey
                        )
                        .orElseGet(
                                AppNotification::new
                        );

        notification.setUser(user);
        notification.setNotificationType(type);
        notification.setSeverity(severity);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setSourceType(sourceType);
        notification.setSourcePublicId(sourcePublicId);
        notification.setActionUrl(actionUrl);
        notification.setDedupeKey(dedupeKey);

        notificationRepository.saveAndFlush(
                notification
        );
    }

    private NotificationSummaryResponse buildSummary(
            Long userId
    ) {
        return new NotificationSummaryResponse(
                notificationRepository
                        .countByUserIdAndArchivedAtIsNull(
                                userId
                        ),
                notificationRepository
                        .countByUserIdAndArchivedAtIsNullAndReadAtIsNull(
                                userId
                        )
        );
    }

    private AppNotification getNotificationForUpdate(
            Long userId,
            String publicId
    ) {
        return notificationRepository
                .findVisibleOwnedForUpdate(
                        normalizeIdentifier(
                                publicId
                        ),
                        userId
                )
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        NotificationMessages
                                                .NOT_FOUND
                                )
                );
    }

    private User getAuthenticatedUser(
            String authenticatedEmail
    ) {
        if (
                authenticatedEmail == null ||
                authenticatedEmail.isBlank()
        ) {
            throw new ResourceNotFoundException(
                    ApplicationMessages
                            .USER_ACCOUNT_NOT_FOUND
            );
        }

        return userRepository
                .findByEmailIgnoreCase(
                        authenticatedEmail
                )
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        ApplicationMessages
                                                .USER_ACCOUNT_NOT_FOUND
                                )
                );
    }

    private String normalizeIdentifier(
            String value
    ) {
        if (
                value == null ||
                value.isBlank()
        ) {
            throw new ResourceNotFoundException(
                    NotificationMessages.NOT_FOUND
            );
        }

        return value.trim();
    }

    private int resolveLimit(
            Integer limit
    ) {
        if (
                limit == null ||
                limit <= 0
        ) {
            return NotificationValidationConstants
                    .DEFAULT_LIST_LIMIT;
        }

        return Math.min(
                limit,
                NotificationValidationConstants
                        .MAX_LIST_LIMIT
        );
    }
}
