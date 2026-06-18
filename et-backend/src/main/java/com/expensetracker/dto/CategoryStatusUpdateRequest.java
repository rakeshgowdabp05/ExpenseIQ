package com.expensetracker.dto;

import com.expensetracker.common.CategoryValidationMessages;
import jakarta.validation.constraints.NotNull;

public record CategoryStatusUpdateRequest(

        @NotNull(
                message =
                        CategoryValidationMessages.ACTIVE_REQUIRED
        )
        Boolean active
) {
}