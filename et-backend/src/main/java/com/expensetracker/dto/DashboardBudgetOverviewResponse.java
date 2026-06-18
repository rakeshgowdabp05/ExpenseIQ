package com.expensetracker.dto;

public record DashboardBudgetOverviewResponse(

        BudgetSummaryResponse summary,

        BudgetResponse overallBudget,

        BudgetResponse highestRiskCategoryBudget
) {
}