package com.expensetracker.controller;

import com.expensetracker.common.ApiResponse;
import com.expensetracker.common.ApiResponseFactory;
import com.expensetracker.common.ApplicationMessages;
import com.expensetracker.common.DashboardApiPaths;
import com.expensetracker.dto.DashboardResponse;
import com.expensetracker.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(DashboardApiPaths.BASE_PATH)
public class DashboardController {

    private final DashboardService
            dashboardService;

    private final ApiResponseFactory
            responseFactory;

    public DashboardController(
            DashboardService dashboardService,
            ApiResponseFactory responseFactory
    ) {
        this.dashboardService = dashboardService;
        this.responseFactory = responseFactory;
    }

    @GetMapping
    public ResponseEntity<
            ApiResponse<DashboardResponse>
            > getDashboard(
            Authentication authentication
    ) {
        DashboardResponse dashboard =
                dashboardService.getDashboard(
                        authentication.getName()
                );

        return ResponseEntity.ok(
                responseFactory.success(
                        ApplicationMessages
                                .DASHBOARD_FETCH_SUCCESS,
                        dashboard
                )
        );
    }
}