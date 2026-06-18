package com.expensetracker.service.impl;

import com.expensetracker.common.ApplicationMessages;
import com.expensetracker.config.JwtTokenService;
import com.expensetracker.config.SecurityConstants;
import com.expensetracker.dto.AuthenticatedUserResponse;
import com.expensetracker.dto.LoginRequest;
import com.expensetracker.dto.LoginResponse;
import com.expensetracker.dto.RegisterRequest;
import com.expensetracker.dto.RegisterResponse;
import com.expensetracker.dto.TokenRefreshResponse;
import com.expensetracker.entity.AccountStatus;
import com.expensetracker.entity.Role;
import com.expensetracker.entity.RoleCode;
import com.expensetracker.entity.User;
import com.expensetracker.exception.ConflictException;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.exception.UnauthorizedException;
import com.expensetracker.repository.RoleRepository;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.service.AuthService;
import com.expensetracker.service.LoginFailureService;
import com.expensetracker.service.LoginProtectionService;
import com.expensetracker.service.RefreshTokenService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.Locale;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenService jwtTokenService;
    private final RefreshTokenService refreshTokenService;
    private final LoginProtectionService loginProtectionService;
    private final LoginFailureService loginFailureService;
    private final Clock clock;

    public AuthServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtTokenService jwtTokenService,
            RefreshTokenService refreshTokenService,
            LoginProtectionService loginProtectionService,
            LoginFailureService loginFailureService,
            Clock clock
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenService = jwtTokenService;
        this.refreshTokenService = refreshTokenService;
        this.loginProtectionService = loginProtectionService;
        this.loginFailureService = loginFailureService;
        this.clock = clock;
    }

    @Override
    @Transactional
    public RegisterResponse register(
            RegisterRequest request
    ) {
        String normalizedEmail =
                normalizeEmail(request.email());

        if (userRepository.existsByEmailIgnoreCase(
                normalizedEmail
        )) {
            throw new ConflictException(
                    ApplicationMessages.EMAIL_ALREADY_REGISTERED
            );
        }

        Role defaultRole =
                roleRepository.findByCodeAndActiveTrue(
                                RoleCode.USER
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        ApplicationMessages
                                                .DEFAULT_ROLE_NOT_AVAILABLE
                                )
                        );

        User user = new User();

        user.setEmail(normalizedEmail);
        user.setPasswordHash(
                passwordEncoder.encode(request.password())
        );
        user.setFirstName(request.firstName().trim());
        user.setLastName(
                normalizeOptionalText(request.lastName())
        );
        user.setPhone(
                normalizeOptionalText(request.phone())
        );
        user.setRegistrationRegionCode(
                normalizeOptionalText(request.registrationRegionCode())
        );
        user.setRegistrationRegionLabel(
                normalizeOptionalText(request.registrationRegionLabel())
        );
        user.setRegistrationLatitude(request.registrationLatitude());
        user.setRegistrationLongitude(request.registrationLongitude());
        user.setRegistrationTimezone(
                normalizeOptionalText(request.registrationTimezone())
        );
        user.setRegistrationLocationSource(
                normalizeOptionalText(request.registrationLocationSource())
        );

        if (
                request.registrationLatitude() != null
                        && request.registrationLongitude() != null
        ) {
            user.setRegistrationLocationCapturedAt(clock.instant());
        }

        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setEmailVerified(false);
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        user.addRole(defaultRole);

        User savedUser =
                userRepository.saveAndFlush(user);

        return RegisterResponse.from(savedUser);
    }

    @Override
    @Transactional
    public LoginResponse login(
            LoginRequest request,
            String ipAddress,
            String userAgent
    ) {
        String normalizedEmail =
                normalizeEmail(request.email());

        loginProtectionService.recordLoginAttempt(
                normalizedEmail,
                ipAddress
        );

        loginFailureService.ensureAccountCanAttemptLogin(
                normalizedEmail
        );

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            normalizedEmail,
                            request.password()
                    )
            );
        } catch (AuthenticationException exception) {
            loginFailureService.recordFailedLogin(
                    normalizedEmail
            );

            throw new UnauthorizedException(
                    ApplicationMessages.INVALID_CREDENTIALS
            );
        }

        User user =
                userRepository
                        .findByEmailIgnoreCase(
                                normalizedEmail
                        )
                        .orElseThrow(() ->
                                new UnauthorizedException(
                                        ApplicationMessages
                                                .INVALID_CREDENTIALS
                                )
                        );

        user.setLastLoginAt(clock.instant());
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);

        userRepository.save(user);

        loginProtectionService.clearLoginAttempts(
                normalizedEmail,
                ipAddress
        );

        JwtTokenService.IssuedAccessToken accessToken =
                jwtTokenService.issueAccessToken(user);

        RefreshTokenService.IssuedRefreshToken refreshToken =
                refreshTokenService.issue(
                        user,
                        request.deviceName(),
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

    @Override
    @Transactional
    public TokenRefreshResponse refresh(
            String rawRefreshToken,
            String ipAddress,
            String userAgent
    ) {
        RefreshTokenService.RotatedRefreshToken rotatedToken =
                refreshTokenService.rotate(
                        rawRefreshToken,
                        ipAddress,
                        userAgent
                );

        JwtTokenService.IssuedAccessToken accessToken =
                jwtTokenService.issueAccessToken(
                        rotatedToken.user()
                );

        return new TokenRefreshResponse(
                SecurityConstants.BEARER_TOKEN_TYPE,
                accessToken.token(),
                accessToken.expiresAt(),
                rotatedToken.rawToken(),
                rotatedToken.expiresAt()
        );
    }

    @Override
    @Transactional
    public void logout(String rawRefreshToken) {
        refreshTokenService.revoke(rawRefreshToken);
    }

    private String normalizeEmail(String email) {
        return email
                .trim()
                .toLowerCase(Locale.ROOT);
    }

    private String normalizeOptionalText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}
