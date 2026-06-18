package com.expensetracker.config;

public final class OAuthSessionConstants {

    public static final String LATITUDE =
            "expenseiq.oauth.latitude";
    public static final String LONGITUDE =
            "expenseiq.oauth.longitude";
    public static final String TIMEZONE =
            "expenseiq.oauth.timezone";
    public static final String LOCATION_SOURCE =
            "expenseiq.oauth.location-source";

    private OAuthSessionConstants() {
        throw new IllegalStateException(
                "OAuthSessionConstants cannot be instantiated."
        );
    }
}
