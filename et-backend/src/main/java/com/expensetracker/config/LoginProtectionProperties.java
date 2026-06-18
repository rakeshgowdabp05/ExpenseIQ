package com.expensetracker.config;

import jakarta.validation.constraints.Positive;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

@Component
@Validated
@ConfigurationProperties(prefix = "app.security.login")
public class LoginProtectionProperties {

    @Positive
    private int maxFailedAttempts;

    @Positive
    private long lockDurationMinutes;

    @Positive
    private long rateLimitWindowSeconds;

    @Positive
    private int maxAttemptsPerWindow;

    public int getMaxFailedAttempts() {
        return maxFailedAttempts;
    }

    public void setMaxFailedAttempts(
            int maxFailedAttempts
    ) {
        this.maxFailedAttempts =
                maxFailedAttempts;
    }

    public long getLockDurationMinutes() {
        return lockDurationMinutes;
    }

    public void setLockDurationMinutes(
            long lockDurationMinutes
    ) {
        this.lockDurationMinutes =
                lockDurationMinutes;
    }

    public long getRateLimitWindowSeconds() {
        return rateLimitWindowSeconds;
    }

    public void setRateLimitWindowSeconds(
            long rateLimitWindowSeconds
    ) {
        this.rateLimitWindowSeconds =
                rateLimitWindowSeconds;
    }

    public int getMaxAttemptsPerWindow() {
        return maxAttemptsPerWindow;
    }

    public void setMaxAttemptsPerWindow(
            int maxAttemptsPerWindow
    ) {
        this.maxAttemptsPerWindow =
                maxAttemptsPerWindow;
    }
}
