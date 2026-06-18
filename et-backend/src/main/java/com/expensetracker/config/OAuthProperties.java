package com.expensetracker.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.oauth")
public record OAuthProperties(
        String frontendBaseUrl,
        Provider google,
        Provider facebook,
        Provider linkedin
) {

    public OAuthProperties {
        frontendBaseUrl = normalizeBaseUrl(frontendBaseUrl);
        google = google == null ? Provider.disabled() : google;
        facebook = facebook == null ? Provider.disabled() : facebook;
        linkedin = linkedin == null ? Provider.disabled() : linkedin;
    }

    public Provider provider(String registrationId) {
        return switch (registrationId) {
            case "google" -> google;
            case "facebook" -> facebook;
            case "linkedin" -> linkedin;
            default -> Provider.disabled();
        };
    }

    public boolean anyConfigured() {
        return google.configured()
                || facebook.configured()
                || linkedin.configured();
    }

    private static String normalizeBaseUrl(String value) {
        if (value == null || value.isBlank()) {
            return "http://localhost:5173";
        }

        return value.trim().replaceAll("/+$", "");
    }

    public record Provider(
            boolean enabled,
            String clientId,
            String clientSecret
    ) {
        public Provider {
            clientId = normalize(clientId);
            clientSecret = normalize(clientSecret);
        }

        public boolean configured() {
            return enabled
                    && clientId != null
                    && clientSecret != null;
        }

        private static Provider disabled() {
            return new Provider(false, null, null);
        }

        private static String normalize(String value) {
            if (value == null || value.isBlank()) {
                return null;
            }

            return value.trim();
        }
    }
}
