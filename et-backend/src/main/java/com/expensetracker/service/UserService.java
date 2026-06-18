package com.expensetracker.service;

import com.expensetracker.dto.ChangePasswordRequest;
import com.expensetracker.dto.UpdateUserLocationRequest;
import com.expensetracker.dto.UpdateUserPreferencesRequest;
import com.expensetracker.dto.UpdateUserProfileRequest;
import com.expensetracker.dto.UserProfileResponse;
import com.expensetracker.dto.UserSessionResponse;

import java.util.List;

public interface UserService {

    UserProfileResponse getCurrentUser(
            String authenticatedEmail
    );

    UserProfileResponse updateProfile(
            String authenticatedEmail,
            UpdateUserProfileRequest request
    );

    UserProfileResponse updatePreferences(
            String authenticatedEmail,
            UpdateUserPreferencesRequest request
    );

    UserProfileResponse updateLocation(
            String authenticatedEmail,
            UpdateUserLocationRequest request
    );

    void changePassword(
            String authenticatedEmail,
            ChangePasswordRequest request
    );

    List<UserSessionResponse>
    getActiveSessions(
            String authenticatedEmail
    );

    void revokeSession(
            String authenticatedEmail,
            String sessionPublicId
    );

    void revokeAllSessions(
            String authenticatedEmail
    );
}