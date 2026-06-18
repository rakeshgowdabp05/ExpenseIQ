package com.expensetracker.dto;

import jakarta.validation.constraints.NotNull;

public record BudgetStatusUpdateRequest(

        @NotNull(
                message = "Budget active status is required."
        )
        Boolean active
) {
}