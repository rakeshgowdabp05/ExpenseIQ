package com.expensetracker.common;

public final class SettingsMessages {

    public static final String PROFILE_FETCH_SUCCESS =
            "User profile fetched successfully.";

    public static final String PROFILE_UPDATE_SUCCESS =
            "Profile updated successfully.";

    public static final String PREFERENCES_UPDATE_SUCCESS =
            "Preferences updated successfully.";

    public static final String LOCATION_UPDATE_SUCCESS =
            "Location updated successfully.";

    public static final String PASSWORD_CHANGE_SUCCESS =
            "Password changed successfully. Please sign in again.";

    public static final String CURRENT_PASSWORD_INCORRECT =
            "The current password is incorrect.";

    public static final String PASSWORD_CONFIRMATION_MISMATCH =
            "The new password and confirmation do not match.";

    public static final String PASSWORD_MUST_BE_DIFFERENT =
            "The new password must be different from the current password.";

    public static final String INVALID_TIMEZONE =
            "Select a valid timezone.";

    public static final String INVALID_LOCATION =
            "Select a valid location.";

    public static final String SESSION_LIST_FETCH_SUCCESS =
            "Active sessions fetched successfully.";

    public static final String SESSION_REVOKE_SUCCESS =
            "Session revoked successfully.";

    public static final String ALL_SESSIONS_REVOKE_SUCCESS =
            "All active sessions were revoked successfully.";

    public static final String SESSION_NOT_FOUND =
            "The requested active session was not found.";

    private SettingsMessages() {
        throw new IllegalStateException(
                "SettingsMessages cannot be instantiated."
        );
    }
}