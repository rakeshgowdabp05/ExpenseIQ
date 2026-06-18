package com.expensetracker.dto;

import com.expensetracker.common.ValidationConstants;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(

        @NotBlank(
                message = "Current password is required."
        )
        @Size(
                max = ValidationConstants.PASSWORD_MAX_LENGTH,
                message = "Current password is too long."
        )
        String currentPassword,

        @NotBlank(
                message = "New password is required."
        )
        @Size(
                min = ValidationConstants.PASSWORD_MIN_LENGTH,
                max = ValidationConstants.PASSWORD_MAX_LENGTH,
                message = "New password must contain between 8 and 72 characters."
        )
        String newPassword,

        @NotBlank(
                message = "Password confirmation is required."
        )
        @Size(
                min = ValidationConstants.PASSWORD_MIN_LENGTH,
                max = ValidationConstants.PASSWORD_MAX_LENGTH,
                message = "Password confirmation must contain between 8 and 72 characters."
        )
        String confirmNewPassword
) {
}