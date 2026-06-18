package com.expensetracker.service.impl;

import com.expensetracker.common.ApplicationMessages;
import com.expensetracker.config.LoginProtectionProperties;
import com.expensetracker.exception.UnauthorizedException;
import com.expensetracker.service.LoginProtectionService;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.Instant;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class LoginProtectionServiceImpl
        implements LoginProtectionService {

    private final LoginProtectionProperties
            loginProtectionProperties;

    private final Clock clock;

    private final ConcurrentMap<String, AttemptWindow>
            attemptWindows =
            new ConcurrentHashMap<>();

    public LoginProtectionServiceImpl(
            LoginProtectionProperties
                    loginProtectionProperties,
            Clock clock
    ) {
        this.loginProtectionProperties =
                loginProtectionProperties;

        this.clock = clock;
    }

    @Override
    public void recordLoginAttempt(
            String normalizedEmail,
            String ipAddress
    ) {
        cleanupExpiredWindows();

        String key =
                buildKey(
                        normalizedEmail,
                        ipAddress
                );

        Instant now =
                clock.instant();

        AttemptWindow window =
                attemptWindows.compute(
                        key,
                        (
                                ignoredKey,
                                currentWindow
                        ) -> {
                            if (
                                    currentWindow == null
                                    || currentWindow
                                    .isExpired(
                                            now,
                                            loginProtectionProperties
                                                    .getRateLimitWindowSeconds()
                                    )
                            ) {
                                return new AttemptWindow(
                                        now,
                                        1
                                );
                            }

                            currentWindow.increment();
                            return currentWindow;
                        }
                );

        if (
                window.attempts()
                > loginProtectionProperties
                .getMaxAttemptsPerWindow()
        ) {
            throw new UnauthorizedException(
                    ApplicationMessages
                            .LOGIN_RATE_LIMIT_EXCEEDED
            );
        }
    }

    @Override
    public void clearLoginAttempts(
            String normalizedEmail,
            String ipAddress
    ) {
        attemptWindows.remove(
                buildKey(
                        normalizedEmail,
                        ipAddress
                )
        );
    }

    private void cleanupExpiredWindows() {
        Instant now =
                clock.instant();

        long windowSeconds =
                loginProtectionProperties
                        .getRateLimitWindowSeconds();

        attemptWindows.entrySet()
                .removeIf(entry ->
                        entry.getValue()
                                .isExpired(
                                        now,
                                        windowSeconds
                                )
                );
    }

    private String buildKey(
            String normalizedEmail,
            String ipAddress
    ) {
        return safe(normalizedEmail)
                .toLowerCase(Locale.ROOT)
                + "|"
                + safe(ipAddress);
    }

    private String safe(String value) {
        return value == null
                ? ""
                : value.trim();
    }

    private static final class AttemptWindow {

        private final Instant startedAt;
        private int attempts;

        private AttemptWindow(
                Instant startedAt,
                int attempts
        ) {
            this.startedAt = startedAt;
            this.attempts = attempts;
        }

        private void increment() {
            attempts += 1;
        }

        private int attempts() {
            return attempts;
        }

        private boolean isExpired(
                Instant now,
                long windowSeconds
        ) {
            return startedAt
                    .plusSeconds(windowSeconds)
                    .isBefore(now);
        }
    }
}
