package com.expensetracker.dto;

import com.expensetracker.common.ValidationConstants;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateUserProfileRequest(

        @NotBlank(
                message = "First name is required."
        )
        @Size(
                min = ValidationConstants.NAME_MIN_LENGTH,
                max = ValidationConstants.NAME_MAX_LENGTH,
                message = "First name must contain between 2 and 100 characters."
        )
        String firstName,

        @Size(
                max = ValidationConstants.NAME_MAX_LENGTH,
                message = "Last name must not exceed 100 characters."
        )
        String lastName,

        @Size(
                max = ValidationConstants.PHONE_MAX_LENGTH,
                message = "Phone number is too long."
        )
        @Pattern(
                regexp = ValidationConstants.PHONE_PATTERN,
                message = "Enter a valid phone number."
        )
        String phone
) {
}