package com.expensetracker.dto;

import com.expensetracker.common.GoalMessages;
import com.expensetracker.common.GoalValidationConstants;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record GoalUpdateRequest(

        @NotBlank(
                message = GoalMessages.NAME_REQUIRED
        )
        @Size(
                min = GoalValidationConstants.NAME_MIN_LENGTH,
                max = GoalValidationConstants.NAME_MAX_LENGTH,
                message = GoalMessages.NAME_LENGTH
        )
        String name,

        @Size(
                max = GoalValidationConstants.DESCRIPTION_MAX_LENGTH,
                message = GoalMessages.DESCRIPTION_TOO_LONG
        )
        String description,

        @NotNull(
                message = GoalMessages.TARGET_AMOUNT_REQUIRED
        )
        @DecimalMin(
                value = GoalValidationConstants.MINIMUM_AMOUNT,
                message = GoalMessages.TARGET_AMOUNT_POSITIVE
        )
        @Digits(
                integer = GoalValidationConstants.MONEY_INTEGER_DIGITS,
                fraction = GoalValidationConstants.MONEY_FRACTION_DIGITS,
                message = GoalMessages.MONEY_FORMAT_INVALID
        )
        BigDecimal targetAmount,

        @NotBlank(
                message = GoalMessages.CURRENCY_REQUIRED
        )
        @Pattern(
                regexp = GoalValidationConstants.CURRENCY_PATTERN,
                message = GoalMessages.CURRENCY_INVALID
        )
        String currencyCode,

        @NotNull(
                message = GoalMessages.TARGET_DATE_REQUIRED
        )
        LocalDate targetDate
) {
}