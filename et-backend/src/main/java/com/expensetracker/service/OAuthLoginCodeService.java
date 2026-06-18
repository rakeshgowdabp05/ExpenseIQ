package com.expensetracker.service;

import com.expensetracker.dto.LoginResponse;
import com.expensetracker.entity.OAuthProvider;
import com.expensetracker.entity.User;

public interface OAuthLoginCodeService {

    String issue(User user, OAuthProvider provider);

    LoginResponse exchange(
            String rawCode,
            String deviceName,
            String ipAddress,
            String userAgent
    );
}
