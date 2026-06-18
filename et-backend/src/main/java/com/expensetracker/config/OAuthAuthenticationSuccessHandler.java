package com.expensetracker.config;

import com.expensetracker.dto.OAuthLocationData;
import com.expensetracker.entity.OAuthProvider;
import com.expensetracker.entity.User;
import com.expensetracker.service.OAuthLoginCodeService;
import com.expensetracker.service.SocialLoginService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.math.BigDecimal;

@Component
public class OAuthAuthenticationSuccessHandler
        implements AuthenticationSuccessHandler {

    private final SocialLoginService socialLoginService;
    private final OAuthLoginCodeService loginCodeService;
    private final OAuthProperties oauthProperties;

    public OAuthAuthenticationSuccessHandler(
            SocialLoginService socialLoginService,
            OAuthLoginCodeService loginCodeService,
            OAuthProperties oauthProperties
    ) {
        this.socialLoginService = socialLoginService;
        this.loginCodeService = loginCodeService;
        this.oauthProperties = oauthProperties;
    }

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {
        if (!(authentication instanceof OAuth2AuthenticationToken oauthToken)) {
            throw new ServletException("Unsupported OAuth authentication result.");
        }

        OAuthProvider provider = OAuthProvider.fromRegistrationId(
                oauthToken.getAuthorizedClientRegistrationId()
        );
        OAuth2User principal = oauthToken.getPrincipal();
        OAuthLocationData locationData = readLocation(request.getSession(false));

        User user = socialLoginService.resolveUser(
                provider,
                principal,
                locationData
        );
        String exchangeCode = loginCodeService.issue(user, provider);

        clearLocation(request.getSession(false));

        String redirectUrl = UriComponentsBuilder
                .fromUriString(oauthProperties.frontendBaseUrl())
                .path("/oauth/callback")
                .queryParam("code", exchangeCode)
                .build()
                .encode()
                .toUriString();

        response.sendRedirect(redirectUrl);
    }

    private OAuthLocationData readLocation(HttpSession session) {
        if (session == null) {
            return new OAuthLocationData(null, null, null, null);
        }

        return new OAuthLocationData(
                toBigDecimal(session.getAttribute(OAuthSessionConstants.LATITUDE)),
                toBigDecimal(session.getAttribute(OAuthSessionConstants.LONGITUDE)),
                toStringValue(session.getAttribute(OAuthSessionConstants.TIMEZONE)),
                toStringValue(session.getAttribute(OAuthSessionConstants.LOCATION_SOURCE))
        );
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) {
            return null;
        }

        try {
            return new BigDecimal(value.toString());
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private String toStringValue(Object value) {
        if (value == null || value.toString().isBlank()) {
            return null;
        }

        return value.toString().trim();
    }

    private void clearLocation(HttpSession session) {
        if (session == null) {
            return;
        }

        session.removeAttribute(OAuthSessionConstants.LATITUDE);
        session.removeAttribute(OAuthSessionConstants.LONGITUDE);
        session.removeAttribute(OAuthSessionConstants.TIMEZONE);
        session.removeAttribute(OAuthSessionConstants.LOCATION_SOURCE);
    }
}
