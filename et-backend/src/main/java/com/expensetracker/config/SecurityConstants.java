package com.expensetracker.config;

public final class SecurityConstants {

    public static final String ROLE_PREFIX =
            "ROLE_";

    public static final String AUTH_BASE_PATH =
            "/api/v1/auth";

    public static final String REGISTER_ENDPOINT =
            "/register";

    public static final String LOGIN_ENDPOINT =
            "/login";

    public static final String REFRESH_ENDPOINT =
            "/refresh";

    public static final String LOGOUT_ENDPOINT =
            "/logout";

    public static final String REGISTER_PATH =
            AUTH_BASE_PATH
                    + REGISTER_ENDPOINT;

    public static final String LOGIN_PATH =
            AUTH_BASE_PATH
                    + LOGIN_ENDPOINT;

    public static final String REFRESH_PATH =
            AUTH_BASE_PATH
                    + REFRESH_ENDPOINT;

    public static final String LOGOUT_PATH =
            AUTH_BASE_PATH
                    + LOGOUT_ENDPOINT;

    public static final String OAUTH_API_PATH_PATTERN =
            AUTH_BASE_PATH
                    + "/oauth/**";

    public static final String OAUTH2_PATH_PATTERN =
            "/oauth2/**";

    public static final String OAUTH2_CALLBACK_PATH_PATTERN =
            "/login/oauth2/**";

    public static final String USER_BASE_PATH =
            "/api/v1/users";

    public static final String CURRENT_USER_ENDPOINT =
            "/me";

    public static final String PROFILE_ENDPOINT =
            CURRENT_USER_ENDPOINT
                    + "/profile";

    public static final String PREFERENCES_ENDPOINT =
            CURRENT_USER_ENDPOINT
                    + "/preferences";

    public static final String LOCATION_ENDPOINT =
            CURRENT_USER_ENDPOINT
                    + "/location";

    public static final String CHANGE_PASSWORD_ENDPOINT =
            CURRENT_USER_ENDPOINT
                    + "/change-password";

    public static final String SESSIONS_ENDPOINT =
            CURRENT_USER_ENDPOINT
                    + "/sessions";

    public static final String SESSION_ID_PATH_VARIABLE =
            "sessionPublicId";

    public static final String SESSION_BY_ID_ENDPOINT =
            SESSIONS_ENDPOINT
                    + "/{"
                    + SESSION_ID_PATH_VARIABLE
                    + "}";

    public static final String CURRENT_USER_PATH =
            USER_BASE_PATH
                    + CURRENT_USER_ENDPOINT;

    public static final String ACTUATOR_HEALTH_PATH =
            "/actuator/health";

    public static final String ACTUATOR_PATH_PATTERN =
            "/actuator/**";

    public static final String TOKEN_TYPE_CLAIM =
            "token_type";

    public static final String ACCESS_TOKEN_TYPE =
            "ACCESS";

    public static final String BEARER_TOKEN_TYPE =
            "Bearer";

    public static final String BEARER_PREFIX =
            BEARER_TOKEN_TYPE + " ";

    public static final String AUTHORIZATION_HEADER =
            "Authorization";

    public static final String EMAIL_CLAIM =
            "email";

    public static final String ROLES_CLAIM =
            "roles";

    public static final String USER_AGENT_HEADER =
            "User-Agent";

    private SecurityConstants() {
        throw new IllegalStateException(
                "SecurityConstants cannot be instantiated."
        );
    }
}