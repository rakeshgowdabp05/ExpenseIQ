package com.expensetracker.service;

import com.expensetracker.dto.LoginRequest;
import com.expensetracker.dto.LoginResponse;
import com.expensetracker.dto.RegisterRequest;
import com.expensetracker.dto.RegisterResponse;
import com.expensetracker.dto.TokenRefreshResponse;

public interface AuthService {

    RegisterResponse register(RegisterRequest request);

    LoginResponse login(
            LoginRequest request,
            String ipAddress,
            String userAgent
    );

    TokenRefreshResponse refresh(
            String rawRefreshToken,
            String ipAddress,
            String userAgent
    );

    void logout(String rawRefreshToken);
}