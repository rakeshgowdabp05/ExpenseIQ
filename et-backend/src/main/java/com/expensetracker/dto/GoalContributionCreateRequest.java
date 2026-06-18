package com.expensetracker.dto;

import com.expensetracker.common.GoalMessages;
import com.expensetracker.common.GoalValidationConstants;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record GoalContributionCreateRequest(

        String sourceAccountPublicId,

        @NotNull(
                message = GoalMessages.CONTRIBUTION_AMOUNT_REQUIRED
        )
        @Positive(
                message = GoalMessages.CONTRIBUTION_AMOUNT_POSITIVE
        )
        @Digits(
                integer = GoalValidationConstants.MONEY_INTEGER_DIGITS,
                fraction = GoalValidationConstants.MONEY_FRACTION_DIGITS,
                message = GoalMessages.MONEY_FORMAT_INVALID
        )
        BigDecimal amount,

        @NotNull(
                message = GoalMessages.CONTRIBUTION_DATE_REQUIRED
        )
        @PastOrPresent(
                message = GoalMessages.CONTRIBUTION_DATE_FUTURE
        )
        LocalDate contributionDate,

        @Size(
                max = GoalValidationConstants.NOTE_MAX_LENGTH,
                message = GoalMessages.NOTE_TOO_LONG
        )
        String note,

        @Size(
                max = GoalValidationConstants.REFERENCE_MAX_LENGTH,
                message = GoalMessages.REFERENCE_TOO_LONG
        )
        String referenceNumber
) {
}