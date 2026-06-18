package com.expensetracker.service;

import com.expensetracker.dto.AnalyticsResponse;

import java.time.LocalDate;

public interface AnalyticsService {

    AnalyticsResponse getAnalytics(
            String authenticatedEmail,
            LocalDate fromDate,
            LocalDate toDate
    );
}