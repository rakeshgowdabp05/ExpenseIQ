package com.expensetracker.config;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.security.password")
public record PasswordProperties(

        @Min(10)
        @Max(16)
        int bcryptStrength
) {
}