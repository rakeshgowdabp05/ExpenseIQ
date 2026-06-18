package com.expensetracker.dto;

import com.expensetracker.common.ValidationConstants;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateUserLocationRequest(

        @NotNull(message = "Latitude is required.")
        @DecimalMin(
                value = "-90.00000",
                message = "Latitude must be at least -90."
        )
        @DecimalMax(
                value = "90.00000",
                message = "Latitude must not exceed 90."
        )
        BigDecimal latitude,

        @NotNull(message = "Longitude is required.")
        @DecimalMin(
                value = "-180.00000",
                message = "Longitude must be at least -180."
        )
        @DecimalMax(
                value = "180.00000",
                message = "Longitude must not exceed 180."
        )
        BigDecimal longitude,

        @Size(
                max = ValidationConstants.REGION_CODE_MAX_LENGTH,
                message = "Region code is too long."
        )
        String regionCode,

        @Size(
                max = ValidationConstants.REGION_LABEL_MAX_LENGTH,
                message = "Region label is too long."
        )
        String regionLabel,

        @Size(
                max = ValidationConstants.TIMEZONE_MAX_LENGTH,
                message = "Timezone is too long."
        )
        String timezone,

        @Size(
                max = ValidationConstants.LOCATION_SOURCE_MAX_LENGTH,
                message = "Location source is too long."
        )
        String locationSource
) {
}