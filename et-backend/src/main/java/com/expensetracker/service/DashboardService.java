package com.expensetracker.service;

import com.expensetracker.dto.DashboardResponse;

public interface DashboardService {

    DashboardResponse getDashboard(
            String authenticatedEmail
    );
}