package com.expensetracker.dto;

import com.expensetracker.entity.AccountStatus;
import com.expensetracker.entity.DateFormatPreference;
import com.expensetracker.entity.Role;
import com.expensetracker.entity.ThemePreference;
import com.expensetracker.entity.User;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record UserProfileResponse(

        String publicId,

        String email,

        String firstName,

        String lastName,

        String phone,

        AccountStatus accountStatus,

        boolean emailVerified,

        List<String> roles,

        Instant createdAt,

        Instant lastLoginAt,

        String registrationRegionCode,

        String registrationRegionLabel,

        BigDecimal registrationLatitude,

        BigDecimal registrationLongitude,

        String registrationTimezone,

        String registrationLocationSource,

        Instant registrationLocationCapturedAt,

        String preferredCurrency,

        String preferredTimezone,

        DateFormatPreference dateFormat,

        ThemePreference themePreference
) {

    public static UserProfileResponse from(
            User user
    ) {
        List<String> roleCodes =
                user.getRoles()
                        .stream()
                        .filter(Role::isActive)
                        .map(role ->
                                role.getCode()
                                        .name()
                        )
                        .sorted()
                        .toList();

        return new UserProfileResponse(
                user.getPublicId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getAccountStatus(),
                user.isEmailVerified(),
                roleCodes,
                user.getCreatedAt(),
                user.getLastLoginAt(),
                user.getRegistrationRegionCode(),
                user.getRegistrationRegionLabel(),
                user.getRegistrationLatitude(),
                user.getRegistrationLongitude(),
                user.getRegistrationTimezone(),
                user.getRegistrationLocationSource(),
                user.getRegistrationLocationCapturedAt(),
                user.getPreferredCurrency(),
                user.getPreferredTimezone(),
                user.getDateFormat(),
                user.getThemePreference()
        );
    }
}