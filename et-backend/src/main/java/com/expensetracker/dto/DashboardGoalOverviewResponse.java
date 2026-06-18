package com.expensetracker.dto;

public record DashboardGoalOverviewResponse(

        GoalSummaryResponse summary,

        GoalResponse nearestUpcomingGoal,

        GoalResponse highestProgressGoal
) {
}