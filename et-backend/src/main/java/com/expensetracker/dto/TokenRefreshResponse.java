package com.expensetracker.dto;

import java.time.Instant;

public record TokenRefreshResponse(

        String tokenType,
        String accessToken,
        Instant accessTokenExpiresAt,
        String refreshToken,
        Instant refreshTokenExpiresAt
) {
}