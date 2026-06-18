package com.expensetracker.dto;

import com.expensetracker.common.AccountValidationMessages;
import jakarta.validation.constraints.NotNull;

public record AccountStatusUpdateRequest(

        @NotNull(
                message =
                        AccountValidationMessages
                                .ACTIVE_STATUS_REQUIRED
        )
        Boolean active
) {
}