package com.expensetracker.dto;

import com.expensetracker.common.ValidationConstants;
import com.expensetracker.entity.DateFormatPreference;
import com.expensetracker.entity.ThemePreference;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateUserPreferencesRequest(

        @Pattern(
                regexp = ValidationConstants.CURRENCY_CODE_PATTERN,
                message = "Preferred currency must be a three-letter currency code."
        )
        String preferredCurrency,

        @NotBlank(
                message = "Preferred timezone is required."
        )
        @Size(
                max = ValidationConstants.TIMEZONE_MAX_LENGTH,
                message = "Preferred timezone is too long."
        )
        String preferredTimezone,

        @NotNull(
                message = "Date format is required."
        )
        DateFormatPreference dateFormat,

        @NotNull(
                message = "Theme preference is required."
        )
        ThemePreference themePreference
) {
}