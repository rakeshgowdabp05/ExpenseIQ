package com.expensetracker.dto;

import com.expensetracker.common.BudgetMessages;
import com.expensetracker.common.BudgetValidationConstants;
import com.expensetracker.entity.BudgetPeriodType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record BudgetUpdateRequest(

        @NotBlank(
                message = BudgetMessages.NAME_REQUIRED
        )
        @Size(
                max = BudgetValidationConstants.NAME_MAX_LENGTH,
                message = BudgetMessages.NAME_TOO_LONG
        )
        String name,

        String categoryPublicId,

        @NotNull(
                message = BudgetMessages.LIMIT_REQUIRED
        )
        @DecimalMin(
                value = BudgetValidationConstants.MINIMUM_LIMIT_AMOUNT,
                message = BudgetMessages.LIMIT_POSITIVE
        )
        @Digits(
                integer = 17,
                fraction = 2
        )
        BigDecimal limitAmount,

        @NotBlank(
                message = BudgetMessages.CURRENCY_REQUIRED
        )
        @Pattern(
                regexp = BudgetValidationConstants.CURRENCY_PATTERN,
                message = BudgetMessages.CURRENCY_INVALID
        )
        String currencyCode,

        @NotNull(
                message = BudgetMessages.PERIOD_REQUIRED
        )
        BudgetPeriodType periodType,

        @Pattern(
                regexp = BudgetValidationConstants.MONTH_PATTERN,
                message = BudgetMessages.INVALID_MONTH
        )
        String month,

        LocalDate startDate,

        LocalDate endDate,

        @Min(
                value = BudgetValidationConstants.WARNING_THRESHOLD_MIN,
                message = BudgetMessages.WARNING_THRESHOLD_INVALID
        )
        @Max(
                value = BudgetValidationConstants.WARNING_THRESHOLD_MAX,
                message = BudgetMessages.WARNING_THRESHOLD_INVALID
        )
        Integer warningThreshold
) {
}