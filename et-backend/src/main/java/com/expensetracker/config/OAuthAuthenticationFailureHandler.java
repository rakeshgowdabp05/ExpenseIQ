package com.expensetracker.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuthAuthenticationFailureHandler
        implements AuthenticationFailureHandler {

    private final OAuthProperties oauthProperties;

    public OAuthAuthenticationFailureHandler(
            OAuthProperties oauthProperties
    ) {
        this.oauthProperties = oauthProperties;
    }

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException {
        String redirectUrl = UriComponentsBuilder
                .fromUriString(oauthProperties.frontendBaseUrl())
                .path("/login")
                .queryParam(
                        "oauthError",
                        "Social sign-in could not be completed."
                )
                .build()
                .encode()
                .toUriString();

        response.sendRedirect(redirectUrl);
    }
}
