package com.expensetracker.service.impl;

import com.expensetracker.common.ApplicationMessages;
import com.expensetracker.common.SettingsMessages;
import com.expensetracker.common.ValidationConstants;
import com.expensetracker.dto.ChangePasswordRequest;
import com.expensetracker.dto.UpdateUserLocationRequest;
import com.expensetracker.dto.UpdateUserPreferencesRequest;
import com.expensetracker.dto.UpdateUserProfileRequest;
import com.expensetracker.dto.UserProfileResponse;
import com.expensetracker.dto.UserSessionResponse;
import com.expensetracker.entity.RefreshToken;
import com.expensetracker.entity.User;
import com.expensetracker.exception.BadRequestException;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.repository.RefreshTokenRepository;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.service.UserService;
import com.expensetracker.service.UserTimezoneResolver;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Locale;

@Service
public class UserServiceImpl
        implements UserService {

    private static final int LOCATION_SCALE = 5;

    private static final String DEFAULT_LOCATION_SOURCE =
            "BROWSER_GEOLOCATION";

    private final UserRepository userRepository;

    private final RefreshTokenRepository
            refreshTokenRepository;

    private final PasswordEncoder
            passwordEncoder;

    private final UserTimezoneResolver
            userTimezoneResolver;

    private final Clock clock;

    public UserServiceImpl(
            UserRepository userRepository,
            RefreshTokenRepository
                    refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            UserTimezoneResolver
                    userTimezoneResolver,
            Clock clock
    ) {
        this.userRepository =
                userRepository;

        this.refreshTokenRepository =
                refreshTokenRepository;

        this.passwordEncoder =
                passwordEncoder;

        this.userTimezoneResolver =
                userTimezoneResolver;

        this.clock = clock;
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUser(
            String authenticatedEmail
    ) {
        return UserProfileResponse.from(
                getUser(authenticatedEmail)
        );
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(
            String authenticatedEmail,
            UpdateUserProfileRequest request
    ) {
        User user =
                getUser(authenticatedEmail);

        user.setFirstName(
                request.firstName()
                        .trim()
        );

        user.setLastName(
                normalizeOptionalText(
                        request.lastName()
                )
        );

        user.setPhone(
                normalizeOptionalText(
                        request.phone()
                )
        );

        User savedUser =
                userRepository.saveAndFlush(
                        user
                );

        return UserProfileResponse.from(
                savedUser
        );
    }

    @Override
    @Transactional
    public UserProfileResponse updatePreferences(
            String authenticatedEmail,
            UpdateUserPreferencesRequest request
    ) {
        User user =
                getUser(authenticatedEmail);

        user.setPreferredCurrency(
                normalizeCurrency(
                        request.preferredCurrency()
                )
        );

        user.setPreferredTimezone(
                userTimezoneResolver
                        .canonicalizeRequired(
                                request.preferredTimezone()
                        )
        );

        user.setDateFormat(
                request.dateFormat()
        );

        user.setThemePreference(
                request.themePreference()
        );

        User savedUser =
                userRepository.saveAndFlush(
                        user
                );

        return UserProfileResponse.from(
                savedUser
        );
    }

    @Override
    @Transactional
    public UserProfileResponse updateLocation(
            String authenticatedEmail,
            UpdateUserLocationRequest request
    ) {
        User user =
                getUser(authenticatedEmail);

        BigDecimal latitude =
                normalizeLatitude(
                        request.latitude()
                );

        BigDecimal longitude =
                normalizeLongitude(
                        request.longitude()
                );

        String timezone =
                normalizeOptionalText(
                        request.timezone()
                );

        if (timezone != null) {
            String canonicalTimezone =
                    userTimezoneResolver
                            .canonicalizeRequired(
                                    timezone
                            );

            user.setRegistrationTimezone(
                    canonicalTimezone
            );

            if (
                    user.getPreferredTimezone() == null
                            || user.getPreferredTimezone()
                            .isBlank()
            ) {
                user.setPreferredTimezone(
                        canonicalTimezone
                );
            }
        }

        user.setRegistrationLatitude(
                latitude
        );

        user.setRegistrationLongitude(
                longitude
        );

        user.setRegistrationRegionCode(
        normalizeRegionCode(
                request.regionCode(),
                latitude,
                longitude
        )
);

user.setRegistrationRegionLabel(
        normalizeRegionLabel(
                request.regionLabel(),
                latitude,
                longitude
        )
);

user.setRegistrationLocationSource(
        normalizeLocationSource(
                request.locationSource()
        )
);

        user.setRegistrationLocationCapturedAt(
                clock.instant()
        );

        User savedUser =
                userRepository.saveAndFlush(
                        user
                );

        return UserProfileResponse.from(
                savedUser
        );
    }

    @Override
    @Transactional
    public void changePassword(
            String authenticatedEmail,
            ChangePasswordRequest request
    ) {
        User user =
                getUser(authenticatedEmail);

        if (
                !request.newPassword()
                        .equals(
                                request.confirmNewPassword()
                        )
        ) {
            throw new BadRequestException(
                    SettingsMessages
                            .PASSWORD_CONFIRMATION_MISMATCH
            );
        }

        if (
                !passwordEncoder.matches(
                        request.currentPassword(),
                        user.getPasswordHash()
                )
        ) {
            throw new BadRequestException(
                    SettingsMessages
                            .CURRENT_PASSWORD_INCORRECT
            );
        }

        if (
                passwordEncoder.matches(
                        request.newPassword(),
                        user.getPasswordHash()
                )
        ) {
            throw new BadRequestException(
                    SettingsMessages
                            .PASSWORD_MUST_BE_DIFFERENT
            );
        }

        user.setPasswordHash(
                passwordEncoder.encode(
                        request.newPassword()
                )
        );

        userRepository.saveAndFlush(user);

        revokeActiveTokens(
                user,
                clock.instant()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserSessionResponse>
    getActiveSessions(
            String authenticatedEmail
    ) {
        User user =
                getUser(authenticatedEmail);

        Instant currentTime =
                clock.instant();

        return refreshTokenRepository
                .findAllByUserIdAndRevokedAtIsNullAndExpiresAtAfterOrderByIssuedAtDesc(
                        user.getId(),
                        currentTime
                )
                .stream()
                .map(
                        UserSessionResponse::from
                )
                .toList();
    }

    @Override
    @Transactional
    public void revokeSession(
            String authenticatedEmail,
            String sessionPublicId
    ) {
        User user =
                getUser(authenticatedEmail);

        Instant currentTime =
                clock.instant();

        RefreshToken refreshToken =
                refreshTokenRepository
                        .findByPublicIdAndUserId(
                                sessionPublicId,
                                user.getId()
                        )
                        .filter(
                                token ->
                                        token.isUsable(
                                                currentTime
                                        )
                        )
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                SettingsMessages
                                                        .SESSION_NOT_FOUND
                                        )
                        );

        refreshToken.setRevokedAt(
                currentTime
        );

        refreshTokenRepository.save(
                refreshToken
        );
    }

    @Override
    @Transactional
    public void revokeAllSessions(
            String authenticatedEmail
    ) {
        User user =
                getUser(authenticatedEmail);

        revokeActiveTokens(
                user,
                clock.instant()
        );
    }

    private void revokeActiveTokens(
            User user,
            Instant currentTime
    ) {
        List<RefreshToken> tokens =
                refreshTokenRepository
                        .findAllByUserIdAndRevokedAtIsNullAndExpiresAtAfter(
                                user.getId(),
                                currentTime
                        );

        if (tokens.isEmpty()) {
            return;
        }

        tokens.forEach(
                token ->
                        token.setRevokedAt(
                                currentTime
                        )
        );

        refreshTokenRepository
                .saveAll(tokens);
    }

    private User getUser(
            String authenticatedEmail
    ) {
        return userRepository
                .findByEmailIgnoreCase(
                        authenticatedEmail
                )
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        ApplicationMessages
                                                .USER_ACCOUNT_NOT_FOUND
                                )
                );
    }

    private BigDecimal normalizeLatitude(
            BigDecimal latitude
    ) {
        if (
                latitude == null
                        || latitude.compareTo(
                        BigDecimal.valueOf(-90)
                ) < 0
                        || latitude.compareTo(
                        BigDecimal.valueOf(90)
                ) > 0
        ) {
            throw new BadRequestException(
                    SettingsMessages.INVALID_LOCATION
            );
        }

        return latitude.setScale(
                LOCATION_SCALE,
                RoundingMode.HALF_UP
        );
    }

    private BigDecimal normalizeLongitude(
            BigDecimal longitude
    ) {
        if (
                longitude == null
                        || longitude.compareTo(
                        BigDecimal.valueOf(-180)
                ) < 0
                        || longitude.compareTo(
                        BigDecimal.valueOf(180)
                ) > 0
        ) {
            throw new BadRequestException(
                    SettingsMessages.INVALID_LOCATION
            );
        }

        return longitude.setScale(
                LOCATION_SCALE,
                RoundingMode.HALF_UP
        );
    }

    private String buildRegionCode(
            BigDecimal latitude,
            BigDecimal longitude
    ) {
        return "GEO_"
                + latitude.toPlainString()
                + "_"
                + longitude.toPlainString();
    }

    private String buildRegionLabel(
            BigDecimal latitude,
            BigDecimal longitude
    ) {
        return "Lat "
                + latitude.toPlainString()
                + ", Lng "
                + longitude.toPlainString();
    }

    private String normalizeLocationSource(
            String locationSource
    ) {
        String normalized =
                normalizeOptionalText(
                        locationSource
                );

        if (normalized == null) {
            return DEFAULT_LOCATION_SOURCE;
        }

        if (
                normalized.length()
                        > ValidationConstants
                        .LOCATION_SOURCE_MAX_LENGTH
        ) {
            throw new BadRequestException(
                    SettingsMessages.INVALID_LOCATION
            );
        }

        return normalized;
    }

    private String normalizeRegionCode(
        String regionCode,
        BigDecimal latitude,
        BigDecimal longitude
) {
    String normalized =
            normalizeOptionalText(regionCode);

    if (normalized != null) {
        return normalized;
    }

    return "GEO_"
            + latitude.toPlainString()
            + "_"
            + longitude.toPlainString();
}

private String normalizeRegionLabel(
        String regionLabel,
        BigDecimal latitude,
        BigDecimal longitude
) {
    String normalized =
            normalizeOptionalText(regionLabel);

    if (normalized != null) {
        return normalized;
    }

    return "Lat "
            + latitude.toPlainString()
            + ", Lng "
            + longitude.toPlainString();
}

    private String normalizeCurrency(
            String currency
    ) {
        if (
                currency == null
                        || currency.isBlank()
        ) {
            return null;
        }

        return currency.trim()
                .toUpperCase(
                        Locale.ROOT
                );
    }

    private String normalizeOptionalText(
            String value
    ) {
        if (
                value == null
                        || value.isBlank()
        ) {
            return null;
        }

        return value.trim();
    }
}