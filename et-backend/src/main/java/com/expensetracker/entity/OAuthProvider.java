package com.expensetracker.entity;

import java.util.Locale;

public enum OAuthProvider {
    GOOGLE,
    FACEBOOK,
    LINKEDIN;

    public static OAuthProvider fromRegistrationId(String registrationId) {
        if (registrationId == null || registrationId.isBlank()) {
            throw new IllegalArgumentException("OAuth provider is required.");
        }

        return valueOf(registrationId.trim().toUpperCase(Locale.ROOT));
    }

    public String registrationId() {
        return name().toLowerCase(Locale.ROOT);
    }
}
