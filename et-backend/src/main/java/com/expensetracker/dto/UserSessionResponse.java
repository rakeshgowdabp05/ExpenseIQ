package com.expensetracker.dto;

import com.expensetracker.entity.RefreshToken;

import java.time.Instant;

public record UserSessionResponse(

        String publicId,

        String deviceName,

        String ipAddress,

        String userAgent,

        Instant issuedAt,

        Instant expiresAt
) {

    public static UserSessionResponse from(
            RefreshToken refreshToken
    ) {
        return new UserSessionResponse(
                refreshToken.getPublicId(),
                refreshToken.getDeviceName(),
                refreshToken.getIpAddress(),
                refreshToken.getUserAgent(),
                refreshToken.getIssuedAt(),
                refreshToken.getExpiresAt()
        );
    }
}