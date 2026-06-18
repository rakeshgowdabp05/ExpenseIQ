package com.expensetracker.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.security.jwt")
public record JwtProperties(

        @NotBlank
        String secret,

        @NotBlank
        String issuer,

        @Positive
        long accessTokenExpirationMs,

        @Positive
        long refreshTokenExpirationMs
) {
}
