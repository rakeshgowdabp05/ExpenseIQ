package com.expensetracker.controller;

import com.expensetracker.dto.LoginRequest;
import com.expensetracker.dto.LoginResponse;
import com.expensetracker.dto.RefreshTokenRequest;
import com.expensetracker.dto.RegisterRequest;
import com.expensetracker.dto.RegisterResponse;
import com.expensetracker.dto.TokenRefreshResponse;
import com.expensetracker.service.AuthService;
import com.expensetracker.common.ApiResponse;
import com.expensetracker.common.ApiResponseFactory;
import com.expensetracker.common.ApplicationMessages;
import com.expensetracker.config.SecurityConstants;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(SecurityConstants.AUTH_BASE_PATH)
public class AuthController {

    private final AuthService authService;
    private final ApiResponseFactory responseFactory;

    public AuthController(
            AuthService authService,
            ApiResponseFactory responseFactory
    ) {
        this.authService = authService;
        this.responseFactory = responseFactory;
    }

    @PostMapping(SecurityConstants.REGISTER_ENDPOINT)
    public ResponseEntity<ApiResponse<RegisterResponse>>
    register(
            @Valid
            @RequestBody
            RegisterRequest request
    ) {
        RegisterResponse registeredUser =
                authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        responseFactory.success(
                                ApplicationMessages
                                        .REGISTRATION_SUCCESS,
                                registeredUser
                        )
                );
    }

    @PostMapping(SecurityConstants.LOGIN_ENDPOINT)
    public ResponseEntity<ApiResponse<LoginResponse>>
    login(
            @Valid
            @RequestBody
            LoginRequest request,
            HttpServletRequest httpRequest
    ) {
        LoginResponse loginResponse =
                authService.login(
                        request,
                        httpRequest.getRemoteAddr(),
                        httpRequest.getHeader(
                                SecurityConstants
                                        .USER_AGENT_HEADER
                        )
                );

        return ResponseEntity.ok(
                responseFactory.success(
                        ApplicationMessages.LOGIN_SUCCESS,
                        loginResponse
                )
        );
    }

    @PostMapping(SecurityConstants.REFRESH_ENDPOINT)
    public ResponseEntity<ApiResponse<TokenRefreshResponse>>
    refresh(
            @Valid
            @RequestBody
            RefreshTokenRequest request,
            HttpServletRequest httpRequest
    ) {
        TokenRefreshResponse refreshResponse =
                authService.refresh(
                        request.refreshToken(),
                        httpRequest.getRemoteAddr(),
                        httpRequest.getHeader(
                                SecurityConstants
                                        .USER_AGENT_HEADER
                        )
                );

        return ResponseEntity.ok(
                responseFactory.success(
                        ApplicationMessages
                                .TOKEN_REFRESH_SUCCESS,
                        refreshResponse
                )
        );
    }

    @PostMapping(SecurityConstants.LOGOUT_ENDPOINT)
    public ResponseEntity<ApiResponse<Void>>
    logout(
            @Valid
            @RequestBody
            RefreshTokenRequest request
    ) {
        authService.logout(request.refreshToken());

        return ResponseEntity.ok(
                responseFactory.success(
                        ApplicationMessages.LOGOUT_SUCCESS,
                        null
                )
        );
    }
}