package com.expensetracker.service;

import com.expensetracker.dto.OAuthLocationData;
import com.expensetracker.entity.OAuthProvider;
import com.expensetracker.entity.User;
import org.springframework.security.oauth2.core.user.OAuth2User;

public interface SocialLoginService {

    User resolveUser(
            OAuthProvider provider,
            OAuth2User principal,
            OAuthLocationData locationData
    );
}
