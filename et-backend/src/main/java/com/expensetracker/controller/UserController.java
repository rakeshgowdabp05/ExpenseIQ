package com.expensetracker.controller;

import com.expensetracker.common.ApiResponse;
import com.expensetracker.common.ApiResponseFactory;
import com.expensetracker.common.ApplicationMessages;
import com.expensetracker.common.SettingsMessages;
import com.expensetracker.config.SecurityConstants;
import com.expensetracker.dto.ChangePasswordRequest;
import com.expensetracker.dto.UpdateUserLocationRequest;
import com.expensetracker.dto.UpdateUserPreferencesRequest;
import com.expensetracker.dto.UpdateUserProfileRequest;
import com.expensetracker.dto.UserProfileResponse;
import com.expensetracker.dto.UserSessionResponse;
import com.expensetracker.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(
        SecurityConstants.USER_BASE_PATH
)
public class UserController {

    private final UserService userService;

    private final ApiResponseFactory
            responseFactory;

    public UserController(
            UserService userService,
            ApiResponseFactory responseFactory
    ) {
        this.userService =
                userService;

        this.responseFactory =
                responseFactory;
    }

    @GetMapping(
            SecurityConstants
                    .CURRENT_USER_ENDPOINT
    )
    public ResponseEntity<
            ApiResponse<UserProfileResponse>
            >
    getCurrentUser(
            Authentication authentication
    ) {
        UserProfileResponse userProfile =
                userService.getCurrentUser(
                        authentication.getName()
                );

        return ResponseEntity.ok(
                responseFactory.success(
                        ApplicationMessages
                                .CURRENT_USER_FETCH_SUCCESS,
                        userProfile
                )
        );
    }

    @PatchMapping(
            SecurityConstants
                    .PROFILE_ENDPOINT
    )
    public ResponseEntity<
            ApiResponse<UserProfileResponse>
            >
    updateProfile(
            @Valid
            @RequestBody
            UpdateUserProfileRequest request,
            Authentication authentication
    ) {
        UserProfileResponse userProfile =
                userService.updateProfile(
                        authentication.getName(),
                        request
                );

        return ResponseEntity.ok(
                responseFactory.success(
                        SettingsMessages
                                .PROFILE_UPDATE_SUCCESS,
                        userProfile
                )
        );
    }

    @PatchMapping(
            SecurityConstants
                    .PREFERENCES_ENDPOINT
    )
    public ResponseEntity<
            ApiResponse<UserProfileResponse>
            >
    updatePreferences(
            @Valid
            @RequestBody
            UpdateUserPreferencesRequest request,
            Authentication authentication
    ) {
        UserProfileResponse userProfile =
                userService.updatePreferences(
                        authentication.getName(),
                        request
                );

        return ResponseEntity.ok(
                responseFactory.success(
                        SettingsMessages
                                .PREFERENCES_UPDATE_SUCCESS,
                        userProfile
                )
        );
    }

    @PatchMapping(
            SecurityConstants
                    .LOCATION_ENDPOINT
    )
    public ResponseEntity<
            ApiResponse<UserProfileResponse>
            >
    updateLocation(
            @Valid
            @RequestBody
            UpdateUserLocationRequest request,
            Authentication authentication
    ) {
        UserProfileResponse userProfile =
                userService.updateLocation(
                        authentication.getName(),
                        request
                );

        return ResponseEntity.ok(
                responseFactory.success(
                        SettingsMessages
                                .LOCATION_UPDATE_SUCCESS,
                        userProfile
                )
        );
    }

    @PostMapping(
            SecurityConstants
                    .CHANGE_PASSWORD_ENDPOINT
    )
    public ResponseEntity<
            ApiResponse<Void>
            >
    changePassword(
            @Valid
            @RequestBody
            ChangePasswordRequest request,
            Authentication authentication
    ) {
        userService.changePassword(
                authentication.getName(),
                request
        );

        return ResponseEntity.ok(
                responseFactory.success(
                        SettingsMessages
                                .PASSWORD_CHANGE_SUCCESS,
                        null
                )
        );
    }

    @GetMapping(
            SecurityConstants
                    .SESSIONS_ENDPOINT
    )
    public ResponseEntity<
            ApiResponse<
                    List<UserSessionResponse>
                    >
            >
    getActiveSessions(
            Authentication authentication
    ) {
        List<UserSessionResponse> sessions =
                userService.getActiveSessions(
                        authentication.getName()
                );

        return ResponseEntity.ok(
                responseFactory.success(
                        SettingsMessages
                                .SESSION_LIST_FETCH_SUCCESS,
                        sessions
                )
        );
    }

    @DeleteMapping(
            SecurityConstants
                    .SESSION_BY_ID_ENDPOINT
    )
    public ResponseEntity<
            ApiResponse<Void>
            >
    revokeSession(
            @PathVariable(
                    SecurityConstants
                            .SESSION_ID_PATH_VARIABLE
            )
            String sessionPublicId,
            Authentication authentication
    ) {
        userService.revokeSession(
                authentication.getName(),
                sessionPublicId
        );

        return ResponseEntity.ok(
                responseFactory.success(
                        SettingsMessages
                                .SESSION_REVOKE_SUCCESS,
                        null
                )
        );
    }

    @DeleteMapping(
            SecurityConstants
                    .SESSIONS_ENDPOINT
    )
    public ResponseEntity<
            ApiResponse<Void>
            >
    revokeAllSessions(
            Authentication authentication
    ) {
        userService.revokeAllSessions(
                authentication.getName()
        );

        return ResponseEntity.ok(
                responseFactory.success(
                        SettingsMessages
                                .ALL_SESSIONS_REVOKE_SUCCESS,
                        null
                )
        );
    }
}