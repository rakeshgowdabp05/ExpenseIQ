package com.expensetracker.service;

import com.expensetracker.dto.NotificationGenerationSummaryResponse;

public interface NotificationAlertService {

    NotificationGenerationSummaryResponse generateForAuthenticatedUser(
            String authenticatedEmail,
            String month
    );
}
