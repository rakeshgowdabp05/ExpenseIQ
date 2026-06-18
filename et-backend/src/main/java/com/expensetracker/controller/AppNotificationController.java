package com.expensetracker.controller;

import com.expensetracker.common.ApiResponse;
import com.expensetracker.common.ApiResponseFactory;
import com.expensetracker.common.NotificationApiPaths;
import com.expensetracker.common.NotificationMessages;
import com.expensetracker.dto.NotificationGenerationSummaryResponse;
import com.expensetracker.dto.NotificationResponse;
import com.expensetracker.dto.NotificationSummaryResponse;
import com.expensetracker.service.AppNotificationService;
import com.expensetracker.service.NotificationAlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(NotificationApiPaths.BASE_PATH)
public class AppNotificationController {

    private final AppNotificationService notificationService;

    private final NotificationAlertService notificationAlertService;

    private final ApiResponseFactory responseFactory;

    public AppNotificationController(
            AppNotificationService notificationService,
            NotificationAlertService notificationAlertService,
            ApiResponseFactory responseFactory
    ) {
        this.notificationService =
                notificationService;

        this.notificationAlertService =
                notificationAlertService;

        this.responseFactory =
                responseFactory;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>>
    getNotifications(
            Authentication authentication,

            @RequestParam(defaultValue = "false")
            boolean unreadOnly,

            @RequestParam(required = false)
            Integer limit
    ) {
        return ResponseEntity.ok(
                responseFactory.success(
                        NotificationMessages.LIST_FETCHED,
                        notificationService.getNotifications(
                                authentication.getName(),
                                unreadOnly,
                                limit
                        )
                )
        );
    }

    @GetMapping(NotificationApiPaths.SUMMARY)
    public ResponseEntity<ApiResponse<NotificationSummaryResponse>>
    getSummary(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                responseFactory.success(
                        NotificationMessages.SUMMARY_FETCHED,
                        notificationService.getSummary(
                                authentication.getName()
                        )
                )
        );
    }

    @PostMapping(NotificationApiPaths.GENERATE)
    public ResponseEntity<ApiResponse<NotificationGenerationSummaryResponse>>
    generateNotifications(
            Authentication authentication,

            @RequestParam(required = false)
            String month
    ) {
        return ResponseEntity.ok(
                responseFactory.success(
                        NotificationMessages.GENERATED,
                        notificationAlertService
                                .generateForAuthenticatedUser(
                                        authentication.getName(),
                                        month
                                )
                )
        );
    }

    @PatchMapping(NotificationApiPaths.READ)
    public ResponseEntity<ApiResponse<NotificationResponse>>
    markAsRead(
            Authentication authentication,

            @PathVariable
            String publicId
    ) {
        return ResponseEntity.ok(
                responseFactory.success(
                        NotificationMessages.MARKED_READ,
                        notificationService.markAsRead(
                                authentication.getName(),
                                publicId
                        )
                )
        );
    }

    @PatchMapping(NotificationApiPaths.READ_ALL)
    public ResponseEntity<ApiResponse<NotificationSummaryResponse>>
    markAllAsRead(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                responseFactory.success(
                        NotificationMessages.ALL_MARKED_READ,
                        notificationService.markAllAsRead(
                                authentication.getName()
                        )
                )
        );
    }

    @DeleteMapping(NotificationApiPaths.BY_PUBLIC_ID)
    public ResponseEntity<ApiResponse<Void>> archive(
            Authentication authentication,

            @PathVariable
            String publicId
    ) {
        notificationService.archive(
                authentication.getName(),
                publicId
        );

        return ResponseEntity.ok(
                responseFactory.success(
                        NotificationMessages.ARCHIVED,
                        null
                )
        );
    }
}
