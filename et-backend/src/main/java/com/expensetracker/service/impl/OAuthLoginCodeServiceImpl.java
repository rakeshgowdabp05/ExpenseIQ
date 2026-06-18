package com.expensetracker.service.impl;

import com.expensetracker.common.ApplicationMessages;
import com.expensetracker.config.JwtTokenService;
import com.expensetracker.config.SecureTokenService;
import com.expensetracker.config.SecurityConstants;
import com.expensetracker.dto.AuthenticatedUserResponse;
import com.expensetracker.dto.LoginResponse;
import com.expensetracker.entity.OAuthLoginCode;
import com.expensetracker.entity.OAuthProvider;
import com.expensetracker.entity.User;
import com.expensetracker.exception.UnauthorizedException;
import com.expensetracker.repository.OAuthLoginCodeRepository;
import com.expensetracker.service.OAuthLoginCodeService;
import com.expensetracker.service.RefreshTokenService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;

@Service
public class OAuthLoginCodeServiceImpl
        implements OAuthLoginCodeService {

    private static final Duration CODE_LIFETIME = Duration.ofMinutes(2);

    private final OAuthLoginCodeRepository codeRepository;
    private final SecureTokenService secureTokenService;
    private final JwtTokenService jwtTokenService;
    private final RefreshTokenService refreshTokenService;
    private final Clock clock;

    public OAuthLoginCodeServiceImpl(
            OAuthLoginCodeRepository codeRepository,
            SecureTokenService secureTokenService,
            JwtTokenService jwtTokenService,
            RefreshTokenService refreshTokenService,
            Clock clock
    ) {
        this.codeRepository = codeRepository;
        this.secureTokenService = secureTokenService;
        this.jwtTokenService = jwtTokenService;
        this.refreshTokenService = refreshTokenService;
        this.clock = clock;
    }

    @Override
    @Transactional
    public String issue(User user, OAuthProvider provider) {
        Instant now = clock.instant();
        String rawCode = secureTokenService.generateRefreshToken();

        OAuthLoginCode loginCode = new OAuthLoginCode();
        loginCode.setUser(user);
        loginCode.setProvider(provider);
        loginCode.setCodeHash(secureTokenService.hashToken(rawCode));
        loginCode.setIssuedAt(now);
        loginCode.setExpiresAt(now.plus(CODE_LIFETIME));

        codeRepository.save(loginCode);

        return rawCode;
    }

    @Override
    @Transactional
    public LoginResponse exchange(
            String rawCode,
            String deviceName,
            String ipAddress,
            String userAgent
    ) {
        Instant now = clock.instant();
        String codeHash = secureTokenService.hashToken(rawCode);

        OAuthLoginCode loginCode = codeRepository
                .findByCodeHash(codeHash)
                .orElseThrow(() ->
                        new UnauthorizedException(
                                ApplicationMessages.INVALID_OAUTH_LOGIN_CODE
                        )
                );

        if (!loginCode.isUsable(now)) {
            throw new UnauthorizedException(
                    ApplicationMessages.INVALID_OAUTH_LOGIN_CODE
            );
        }

        loginCode.setUsedAt(now);
        codeRepository.save(loginCode);

        User user = loginCode.getUser();

        JwtTokenService.IssuedAccessToken accessToken =
                jwtTokenService.issueAccessToken(user);

        RefreshTokenService.IssuedRefreshToken refreshToken =
                refreshTokenService.issue(
                        user,
                        deviceName,
                        ipAddress,
                        userAgent
                );

        return new LoginResponse(
                SecurityConstants.BEARER_TOKEN_TYPE,
                accessToken.token(),
                accessToken.expiresAt(),
                refreshToken.rawToken(),
                refreshToken.expiresAt(),
                AuthenticatedUserResponse.from(user)
        );
    }
}
