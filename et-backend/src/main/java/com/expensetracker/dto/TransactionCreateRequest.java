package com.expensetracker.dto;

import com.expensetracker.common.TransactionValidationConstants;
import com.expensetracker.common.TransactionValidationMessages;
import com.expensetracker.entity.TransactionType;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionCreateRequest(

        @NotNull(
                message =
                        TransactionValidationMessages.TYPE_REQUIRED
        )
        TransactionType transactionType,

        @NotBlank(
                message =
                        TransactionValidationMessages.ACCOUNT_REQUIRED
        )
        String accountPublicId,

        String destinationAccountPublicId,

        String categoryPublicId,

        @NotNull(
                message =
                        TransactionValidationMessages.AMOUNT_REQUIRED
        )
        @Positive(
                message =
                        TransactionValidationMessages.AMOUNT_POSITIVE
        )
        @Digits(
                integer =
                        TransactionValidationConstants
                                .MONEY_INTEGER_DIGITS,
                fraction =
                        TransactionValidationConstants
                                .MONEY_FRACTION_DIGITS,
                message =
                        TransactionValidationMessages.AMOUNT_INVALID
        )
        BigDecimal amount,

        @NotNull(
                message =
                        TransactionValidationMessages.DATE_REQUIRED
        )
        @PastOrPresent(
                message =
                        TransactionValidationMessages
                                .DATE_FUTURE_NOT_ALLOWED
        )
        LocalDate transactionDate,

        @Size(
                max =
                        TransactionValidationConstants
                                .MERCHANT_MAX_LENGTH,
                message =
                        TransactionValidationMessages
                                .MERCHANT_TOO_LONG
        )
        String merchantName,

        @Size(
                max =
                        TransactionValidationConstants
                                .DESCRIPTION_MAX_LENGTH,
                message =
                        TransactionValidationMessages
                                .DESCRIPTION_TOO_LONG
        )
        String description,

        @Size(
                max =
                        TransactionValidationConstants
                                .REFERENCE_MAX_LENGTH,
                message =
                        TransactionValidationMessages
                                .REFERENCE_TOO_LONG
        )
        String referenceNumber
) {
}