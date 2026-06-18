package com.expensetracker.dto;

import com.expensetracker.common.AccountValidationConstants;
import com.expensetracker.common.AccountValidationMessages;
import com.expensetracker.entity.AccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record AccountUpdateRequest(

        @NotBlank(
                message =
                        AccountValidationMessages.NAME_REQUIRED
        )
        @Size(
                min =
                        AccountValidationConstants
                                .NAME_MIN_LENGTH,
                max =
                        AccountValidationConstants
                                .NAME_MAX_LENGTH,
                message =
                        AccountValidationMessages.NAME_LENGTH
        )
        String name,

        @NotNull(
                message =
                        AccountValidationMessages.TYPE_REQUIRED
        )
        AccountType accountType,

        @Size(
                max =
                        AccountValidationConstants
                                .INSTITUTION_MAX_LENGTH,
                message =
                        AccountValidationMessages
                                .INSTITUTION_LENGTH
        )
        String institutionName,

        @Pattern(
                regexp =
                        AccountValidationConstants
                                .ACCOUNT_LAST_FOUR_PATTERN,
                message =
                        AccountValidationMessages
                                .LAST_FOUR_INVALID
        )
        String accountNumberLastFour,

        @NotNull(
                message =
                        AccountValidationMessages
                                .INCLUDE_IN_TOTAL_REQUIRED
        )
        Boolean includeInTotal
) {
}