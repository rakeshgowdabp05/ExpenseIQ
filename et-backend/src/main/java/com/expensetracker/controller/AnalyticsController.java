package com.expensetracker.controller;

import com.expensetracker.common.AnalyticsApiPaths;
import com.expensetracker.common.AnalyticsMessages;
import com.expensetracker.common.ApiResponse;
import com.expensetracker.common.ApiResponseFactory;
import com.expensetracker.dto.AnalyticsResponse;
import com.expensetracker.service.AnalyticsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping(AnalyticsApiPaths.BASE_PATH)
public class AnalyticsController {

    private final AnalyticsService
            analyticsService;

    private final ApiResponseFactory
            responseFactory;

    public AnalyticsController(
            AnalyticsService analyticsService,
            ApiResponseFactory responseFactory
    ) {
        this.analyticsService =
                analyticsService;

        this.responseFactory =
                responseFactory;
    }

    @GetMapping
    public ResponseEntity<
            ApiResponse<AnalyticsResponse>
            > getAnalytics(
            Authentication authentication,

            @RequestParam(required = false)
            @DateTimeFormat(
                    iso =
                    DateTimeFormat.ISO.DATE
            )
            LocalDate fromDate,

            @RequestParam(required = false)
            @DateTimeFormat(
                    iso =
                    DateTimeFormat.ISO.DATE
            )
            LocalDate toDate
    ) {
        AnalyticsResponse response =
                analyticsService
                        .getAnalytics(
                                authentication
                                        .getName(),
                                fromDate,
                                toDate
                        );

        return ResponseEntity.ok(
                responseFactory.success(
                        AnalyticsMessages
                                .FETCH_SUCCESS,
                        response
                )
        );
    }
}