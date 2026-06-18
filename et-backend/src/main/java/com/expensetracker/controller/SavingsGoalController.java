package com.expensetracker.controller;

import com.expensetracker.common.ApiResponse;
import com.expensetracker.common.ApiResponseFactory;
import com.expensetracker.common.GoalApiPaths;
import com.expensetracker.common.GoalMessages;
import com.expensetracker.dto.GoalContributionCreateRequest;
import com.expensetracker.dto.GoalContributionResponse;
import com.expensetracker.dto.GoalCreateRequest;
import com.expensetracker.dto.GoalResponse;
import com.expensetracker.dto.GoalStatusUpdateRequest;
import com.expensetracker.dto.GoalSummaryResponse;
import com.expensetracker.dto.GoalUpdateRequest;
import com.expensetracker.entity.GoalStatus;
import com.expensetracker.service.SavingsGoalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(GoalApiPaths.BASE_PATH)
public class SavingsGoalController {

    private final SavingsGoalService
            savingsGoalService;

    private final ApiResponseFactory
            responseFactory;

    public SavingsGoalController(
            SavingsGoalService savingsGoalService,
            ApiResponseFactory responseFactory
    ) {
        this.savingsGoalService =
                savingsGoalService;

        this.responseFactory =
                responseFactory;
    }

    @PostMapping
    public ResponseEntity<
            ApiResponse<GoalResponse>
            > createGoal(
            Authentication authentication,

            @Valid
            @RequestBody
            GoalCreateRequest request
    ) {
        GoalResponse response =
                savingsGoalService.createGoal(
                        authentication.getName(),
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        responseFactory.success(
                                GoalMessages.CREATED,
                                response
                        )
                );
    }

    @PutMapping(GoalApiPaths.BY_PUBLIC_ID)
    public ResponseEntity<
            ApiResponse<GoalResponse>
            > updateGoal(
            Authentication authentication,

            @PathVariable
            String publicId,

            @Valid
            @RequestBody
            GoalUpdateRequest request
    ) {
        return ResponseEntity.ok(
                responseFactory.success(
                        GoalMessages.UPDATED,
                        savingsGoalService
                                .updateGoal(
                                        authentication
                                                .getName(),
                                        publicId,
                                        request
                                )
                )
        );
    }

    @PatchMapping(GoalApiPaths.STATUS)
    public ResponseEntity<
            ApiResponse<GoalResponse>
            > updateStatus(
            Authentication authentication,

            @PathVariable
            String publicId,

            @Valid
            @RequestBody
            GoalStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(
                responseFactory.success(
                        GoalMessages.STATUS_UPDATED,
                        savingsGoalService
                                .updateStatus(
                                        authentication
                                                .getName(),
                                        publicId,
                                        request
                                )
                )
        );
    }

    @GetMapping(GoalApiPaths.BY_PUBLIC_ID)
    public ResponseEntity<
            ApiResponse<GoalResponse>
            > getGoal(
            Authentication authentication,

            @PathVariable
            String publicId
    ) {
        return ResponseEntity.ok(
                responseFactory.success(
                        GoalMessages.FETCHED,
                        savingsGoalService.getGoal(
                                authentication
                                        .getName(),
                                publicId
                        )
                )
        );
    }

    @GetMapping
    public ResponseEntity<
            ApiResponse<List<GoalResponse>>
            > getGoals(
            Authentication authentication,

            @RequestParam(required = false)
            GoalStatus status
    ) {
        return ResponseEntity.ok(
                responseFactory.success(
                        GoalMessages.LIST_FETCHED,
                        savingsGoalService.getGoals(
                                authentication
                                        .getName(),
                                status
                        )
                )
        );
    }

    @GetMapping(GoalApiPaths.SUMMARY)
    public ResponseEntity<
            ApiResponse<GoalSummaryResponse>
            > getSummary(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                responseFactory.success(
                        GoalMessages.SUMMARY_FETCHED,
                        savingsGoalService
                                .getSummary(
                                        authentication
                                                .getName()
                                )
                )
        );
    }

    @DeleteMapping(GoalApiPaths.BY_PUBLIC_ID)
    public ResponseEntity<ApiResponse<Void>>
    archiveGoal(
            Authentication authentication,

            @PathVariable
            String publicId
    ) {
        savingsGoalService.archiveGoal(
                authentication.getName(),
                publicId
        );

        return ResponseEntity.ok(
                responseFactory.success(
                        GoalMessages.ARCHIVED,
                        null
                )
        );
    }

    @PostMapping(
            GoalApiPaths.CONTRIBUTIONS
    )
    public ResponseEntity<
            ApiResponse<
                    GoalContributionResponse
                    >
            > addContribution(
            Authentication authentication,

            @PathVariable
            String publicId,

            @Valid
            @RequestBody
            GoalContributionCreateRequest request
    ) {
        GoalContributionResponse response =
                savingsGoalService
                        .addContribution(
                                authentication
                                        .getName(),
                                publicId,
                                request
                        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        responseFactory.success(
                                GoalMessages
                                        .CONTRIBUTION_CREATED,
                                response
                        )
                );
    }

    @GetMapping(
            GoalApiPaths.CONTRIBUTIONS
    )
    public ResponseEntity<
            ApiResponse<
                    List<
                            GoalContributionResponse
                            >
                    >
            > getContributions(
            Authentication authentication,

            @PathVariable
            String publicId
    ) {
        return ResponseEntity.ok(
                responseFactory.success(
                        GoalMessages
                                .CONTRIBUTIONS_FETCHED,
                        savingsGoalService
                                .getContributions(
                                        authentication
                                                .getName(),
                                        publicId
                                )
                )
        );
    }

    @DeleteMapping(
            GoalApiPaths
                    .CONTRIBUTION_BY_PUBLIC_ID
    )
    public ResponseEntity<ApiResponse<Void>>
    cancelContribution(
            Authentication authentication,

            @PathVariable
            String publicId,

            @PathVariable
            String contributionPublicId
    ) {
        savingsGoalService
                .cancelContribution(
                        authentication.getName(),
                        publicId,
                        contributionPublicId
                );

        return ResponseEntity.ok(
                responseFactory.success(
                        GoalMessages
                                .CONTRIBUTION_CANCELLED,
                        null
                )
        );
    }
}