package com.expensetracker.dto;

import com.expensetracker.common.ValidationConstants;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(

        @NotBlank(message = "Email address is required.")
        @Email(message = "Enter a valid email address.")
        @Size(
                max = ValidationConstants.EMAIL_MAX_LENGTH,
                message = "Email address is too long."
        )
        String email,

        @NotBlank(message = "Password is required.")
        @Size(
                min = ValidationConstants.PASSWORD_MIN_LENGTH,
                max = ValidationConstants.PASSWORD_MAX_LENGTH,
                message = "Password must contain between 8 and 72 characters."
        )
        String password,

        @Size(
                max = 150,
                message = "Device name must not exceed 150 characters."
        )
        String deviceName
) {
}