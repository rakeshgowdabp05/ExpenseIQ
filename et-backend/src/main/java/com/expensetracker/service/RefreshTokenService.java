package com.expensetracker.service;

import com.expensetracker.entity.User;

import java.time.Instant;

public interface RefreshTokenService {

    IssuedRefreshToken issue(
            User user,
            String deviceName,
            String ipAddress,
            String userAgent
    );

    RotatedRefreshToken rotate(
            String rawRefreshToken,
            String ipAddress,
            String userAgent
    );

    void revoke(String rawRefreshToken);

    record IssuedRefreshToken(
            String rawToken,
            Instant expiresAt
    ) {
    }

    record RotatedRefreshToken(
            User user,
            String rawToken,
            Instant expiresAt
    ) {
    }
}