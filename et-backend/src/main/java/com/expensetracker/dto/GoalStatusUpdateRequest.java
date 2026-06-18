package com.expensetracker.dto;

import com.expensetracker.common.GoalMessages;
import com.expensetracker.entity.GoalStatus;
import jakarta.validation.constraints.NotNull;

public record GoalStatusUpdateRequest(

        @NotNull(
                message = GoalMessages.STATUS_REQUIRED
        )
        GoalStatus status
) {
}