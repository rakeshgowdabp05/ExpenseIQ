package com.expensetracker.service;

import com.expensetracker.dto.GoalContributionCreateRequest;
import com.expensetracker.dto.GoalContributionResponse;
import com.expensetracker.dto.GoalCreateRequest;
import com.expensetracker.dto.GoalResponse;
import com.expensetracker.dto.GoalStatusUpdateRequest;
import com.expensetracker.dto.GoalSummaryResponse;
import com.expensetracker.dto.GoalUpdateRequest;
import com.expensetracker.entity.GoalStatus;

import java.util.List;

public interface SavingsGoalService {

    GoalResponse createGoal(
            String authenticatedEmail,
            GoalCreateRequest request
    );

    GoalResponse updateGoal(
            String authenticatedEmail,
            String publicId,
            GoalUpdateRequest request
    );

    GoalResponse updateStatus(
            String authenticatedEmail,
            String publicId,
            GoalStatusUpdateRequest request
    );

    GoalResponse getGoal(
            String authenticatedEmail,
            String publicId
    );

    List<GoalResponse> getGoals(
            String authenticatedEmail,
            GoalStatus status
    );

    GoalSummaryResponse getSummary(
            String authenticatedEmail
    );

    void archiveGoal(
            String authenticatedEmail,
            String publicId
    );

    GoalContributionResponse addContribution(
            String authenticatedEmail,
            String goalPublicId,
            GoalContributionCreateRequest request
    );

    List<GoalContributionResponse>
    getContributions(
            String authenticatedEmail,
            String goalPublicId
    );

    void cancelContribution(
            String authenticatedEmail,
            String goalPublicId,
            String contributionPublicId
    );
}