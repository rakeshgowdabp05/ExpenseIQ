package com.expensetracker.dto;

import com.expensetracker.common.ValidationConstants;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record RegisterRequest(

        @NotBlank(message = "First name is required.")
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
                max = ValidationConstants.PHONE_MAX_LENGTH,
                message = "Phone number is too long."
        )
        @Pattern(
                regexp = ValidationConstants.PHONE_PATTERN,
                message = "Enter a valid phone number."
        )
        String phone,

        @Size(
                max = ValidationConstants.REGION_CODE_MAX_LENGTH,
                message = "Region code is too long."
        )
        String registrationRegionCode,

        @Size(
                max = ValidationConstants.REGION_LABEL_MAX_LENGTH,
                message = "Region label is too long."
        )
        String registrationRegionLabel,

        @DecimalMin(value = "-90.00000", message = "Latitude must be at least -90.")
        @DecimalMax(value = "90.00000", message = "Latitude must not exceed 90.")
        BigDecimal registrationLatitude,

        @DecimalMin(value = "-180.00000", message = "Longitude must be at least -180.")
        @DecimalMax(value = "180.00000", message = "Longitude must not exceed 180.")
        BigDecimal registrationLongitude,

        @Size(
                max = ValidationConstants.TIMEZONE_MAX_LENGTH,
                message = "Timezone is too long."
        )
        String registrationTimezone,

        @Size(
                max = ValidationConstants.LOCATION_SOURCE_MAX_LENGTH,
                message = "Location source is too long."
        )
        String registrationLocationSource
) {
}