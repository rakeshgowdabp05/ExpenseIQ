package com.expensetracker.config;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.analytics")
public record AnalyticsProperties(

        @Min(1)
        @Max(24)
        int defaultMonths,

        @Min(31)
        @Max(3650)
        int maxRangeDays,

        @Min(1)
        @Max(20)
        int topCategoryLimit,

        @Min(1)
        @Max(20)
        int topAccountLimit
) {
}