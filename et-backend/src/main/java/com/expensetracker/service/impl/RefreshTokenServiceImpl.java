package com.expensetracker.service.impl;

import com.expensetracker.entity.RefreshToken;
import com.expensetracker.entity.User;
import com.expensetracker.entity.AccountStatus;
import com.expensetracker.repository.RefreshTokenRepository;
import com.expensetracker.service.RefreshTokenService;
import com.expensetracker.common.ApplicationMessages;
import com.expensetracker.exception.UnauthorizedException;
import com.expensetracker.config.JwtTokenService;
import com.expensetracker.config.SecureTokenService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;

@Service
public class RefreshTokenServiceImpl
        implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final SecureTokenService secureTokenService;
    private final JwtTokenService jwtTokenService;
    private final Clock clock;

    public RefreshTokenServiceImpl(
            RefreshTokenRepository refreshTokenRepository,
            SecureTokenService secureTokenService,
            JwtTokenService jwtTokenService,
            Clock clock
    ) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.secureTokenService = secureTokenService;
        this.jwtTokenService = jwtTokenService;
        this.clock = clock;
    }

    @Override
    @Transactional
    public IssuedRefreshToken issue(
            User user,
            String deviceName,
            String ipAddress,
            String userAgent
    ) {
        Instant issuedAt = clock.instant();

        CreatedRefreshToken createdToken =
                createAndSaveToken(
                        user,
                        deviceName,
                        ipAddress,
                        userAgent,
                        issuedAt
                );

        return new IssuedRefreshToken(
                createdToken.rawToken(),
                createdToken.entity().getExpiresAt()
        );
    }

    @Override
    @Transactional
    public RotatedRefreshToken rotate(
            String rawRefreshToken,
            String ipAddress,
            String userAgent
    ) {
        Instant currentTime = clock.instant();

        RefreshToken existingToken =
                findToken(rawRefreshToken);

        if (!existingToken.isUsable(currentTime)) {
            throw new UnauthorizedException(
                    ApplicationMessages.INVALID_REFRESH_TOKEN
            );
        }

        User user = existingToken.getUser();

        if (user.getAccountStatus()
                != AccountStatus.ACTIVE) {

            throw new UnauthorizedException(
                    ApplicationMessages.INVALID_REFRESH_TOKEN
            );
        }

        CreatedRefreshToken replacement =
                createAndSaveToken(
                        user,
                        existingToken.getDeviceName(),
                        ipAddress,
                        userAgent,
                        currentTime
                );

        existingToken.setRevokedAt(currentTime);
        existingToken.setReplacedByToken(
                replacement.entity()
        );

        refreshTokenRepository.save(existingToken);

        return new RotatedRefreshToken(
                user,
                replacement.rawToken(),
                replacement.entity().getExpiresAt()
        );
    }

    @Override
    @Transactional
    public void revoke(String rawRefreshToken) {
        String tokenHash =
                secureTokenService.hashToken(rawRefreshToken);

        refreshTokenRepository
                .findByTokenHash(tokenHash)
                .ifPresent(token -> {
                    if (!token.isRevoked()) {
                        token.setRevokedAt(clock.instant());
                        refreshTokenRepository.save(token);
                    }
                });
    }

    private RefreshToken findToken(
            String rawRefreshToken
    ) {
        String tokenHash =
                secureTokenService.hashToken(
                        rawRefreshToken
                );

        return refreshTokenRepository
                .findByTokenHash(tokenHash)
                .orElseThrow(() ->
                        new UnauthorizedException(
                                ApplicationMessages
                                        .INVALID_REFRESH_TOKEN
                        )
                );
    }

    private CreatedRefreshToken createAndSaveToken(
            User user,
            String deviceName,
            String ipAddress,
            String userAgent,
            Instant issuedAt
    ) {
        Instant expiresAt = issuedAt.plusMillis(
                jwtTokenService
                        .getRefreshTokenExpirationMs()
        );

        String rawToken =
                secureTokenService.generateRefreshToken();

        RefreshToken refreshToken =
                new RefreshToken();

        refreshToken.setUser(user);
        refreshToken.setTokenHash(
                secureTokenService.hashToken(rawToken)
        );
        refreshToken.setDeviceName(
                normalizeOptionalText(deviceName)
        );
        refreshToken.setIpAddress(
                normalizeOptionalText(ipAddress)
        );
        refreshToken.setUserAgent(
                normalizeOptionalText(userAgent)
        );
        refreshToken.setIssuedAt(issuedAt);
        refreshToken.setExpiresAt(expiresAt);

        RefreshToken savedToken =
                refreshTokenRepository.save(refreshToken);

        return new CreatedRefreshToken(
                rawToken,
                savedToken
        );
    }

    private String normalizeOptionalText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private record CreatedRefreshToken(
            String rawToken,
            RefreshToken entity
    ) {
    }
}