package com.expensetracker.dto;

import com.expensetracker.common.CategoryValidationConstants;
import com.expensetracker.common.CategoryValidationMessages;
import com.expensetracker.entity.CategoryColorKey;
import com.expensetracker.entity.CategoryIconKey;
import com.expensetracker.entity.CategoryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CategoryCreateRequest(

        @NotBlank(
                message =
                        CategoryValidationMessages.NAME_REQUIRED
        )
        @Size(
                min =
                        CategoryValidationConstants
                                .NAME_MIN_LENGTH,
                max =
                        CategoryValidationConstants
                                .NAME_MAX_LENGTH,
                message =
                        CategoryValidationMessages.NAME_LENGTH
        )
        String name,

        @NotNull(
                message =
                        CategoryValidationMessages.TYPE_REQUIRED
        )
        CategoryType categoryType,

        @NotNull(
                message =
                        CategoryValidationMessages.ICON_REQUIRED
        )
        CategoryIconKey iconKey,

        @NotNull(
                message =
                        CategoryValidationMessages.COLOR_REQUIRED
        )
        CategoryColorKey colorKey
) {
}