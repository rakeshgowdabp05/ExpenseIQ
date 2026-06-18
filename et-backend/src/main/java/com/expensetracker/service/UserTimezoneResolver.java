package com.expensetracker.service;

import com.expensetracker.common.SettingsMessages;
import com.expensetracker.entity.User;
import com.expensetracker.exception.BadRequestException;
import org.springframework.stereotype.Component;

import java.time.DateTimeException;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.Map;

@Component
public class UserTimezoneResolver {

    private static final ZoneId DEFAULT_TIMEZONE =
            ZoneOffset.UTC;

    private static final Map<String, String>
            LEGACY_TIMEZONE_ALIASES =
            Map.of(
                    "Asia/Calcutta",
                    "Asia/Kolkata"
            );

    public ZoneId resolve(User user) {
        ZoneId preferredZone =
                resolveOptional(
                        user.getPreferredTimezone()
                );

        if (preferredZone != null) {
            return preferredZone;
        }

        ZoneId registrationZone =
                resolveOptional(
                        user.getRegistrationTimezone()
                );

        return registrationZone == null
                ? DEFAULT_TIMEZONE
                : registrationZone;
    }

    public String canonicalizeRequired(
            String timezone
    ) {
        if (
                timezone == null
                        || timezone.isBlank()
        ) {
            throw new BadRequestException(
                    SettingsMessages.INVALID_TIMEZONE
            );
        }

        String candidate =
                canonicalizeAlias(
                        timezone.trim()
                );

        try {
            return ZoneId.of(candidate)
                    .getId();
        } catch (DateTimeException exception) {
            throw new BadRequestException(
                    SettingsMessages.INVALID_TIMEZONE
            );
        }
    }

    private ZoneId resolveOptional(
            String timezone
    ) {
        if (
                timezone == null
                        || timezone.isBlank()
        ) {
            return null;
        }

        String candidate =
                canonicalizeAlias(
                        timezone.trim()
                );

        try {
            return ZoneId.of(candidate);
        } catch (DateTimeException exception) {
            return null;
        }
    }

    private String canonicalizeAlias(
            String timezone
    ) {
        return LEGACY_TIMEZONE_ALIASES
                .getOrDefault(
                        timezone,
                        timezone
                );
    }
}