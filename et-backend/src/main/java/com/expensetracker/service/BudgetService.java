package com.expensetracker.service;

import com.expensetracker.dto.BudgetCreateRequest;
import com.expensetracker.dto.BudgetResponse;
import com.expensetracker.dto.BudgetStatusUpdateRequest;
import com.expensetracker.dto.BudgetSummaryResponse;
import com.expensetracker.dto.BudgetUpdateRequest;

import java.util.List;

public interface BudgetService {

    BudgetResponse create(
            String authenticatedEmail,
            BudgetCreateRequest request
    );

    BudgetResponse update(
            String authenticatedEmail,
            String publicId,
            BudgetUpdateRequest request
    );

    BudgetResponse updateStatus(
            String authenticatedEmail,
            String publicId,
            BudgetStatusUpdateRequest request
    );

    BudgetResponse getByPublicId(
            String authenticatedEmail,
            String publicId
    );

    List<BudgetResponse> getBudgets(
            String authenticatedEmail,
            String month,
            Boolean active
    );

    BudgetSummaryResponse getSummary(
            String authenticatedEmail,
            String month
    );

    void archive(
            String authenticatedEmail,
            String publicId
    );
}