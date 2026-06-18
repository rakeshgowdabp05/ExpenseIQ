package com.expensetracker.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.IdTokenClaimNames;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class OAuthClientConfiguration {

    private static final String REDIRECT_URI_TEMPLATE =
            "{baseUrl}/login/oauth2/code/{registrationId}";

    @Bean
    public ClientRegistrationRepository clientRegistrationRepository(
            OAuthProperties properties
    ) {
        List<ClientRegistration> registrations =
                new ArrayList<>();

        addGoogle(registrations, properties.google());
        addFacebook(registrations, properties.facebook());
        addLinkedIn(registrations, properties.linkedin());

        return new ConfiguredClientRegistrationRepository(
                registrations
        );
    }

    private void addGoogle(
            List<ClientRegistration> registrations,
            OAuthProperties.Provider provider
    ) {
        if (!provider.configured()) {
            return;
        }

        registrations.add(
                CommonOAuth2Provider.GOOGLE
                        .getBuilder("google")
                        .clientId(provider.clientId())
                        .clientSecret(provider.clientSecret())
                        .redirectUri(REDIRECT_URI_TEMPLATE)
                        .scope("openid", "profile", "email")
                        .clientName("Google")
                        .build()
        );
    }

    private void addFacebook(
            List<ClientRegistration> registrations,
            OAuthProperties.Provider provider
    ) {
        if (!provider.configured()) {
            return;
        }

        registrations.add(
                CommonOAuth2Provider.FACEBOOK
                        .getBuilder("facebook")
                        .clientId(provider.clientId())
                        .clientSecret(provider.clientSecret())
                        .redirectUri(REDIRECT_URI_TEMPLATE)
                        .scope("public_profile", "email")
                        .clientName("Facebook")
                        .build()
        );
    }

    private void addLinkedIn(
            List<ClientRegistration> registrations,
            OAuthProperties.Provider provider
    ) {
        if (!provider.configured()) {
            return;
        }

        registrations.add(
                ClientRegistration
                        .withRegistrationId("linkedin")
                        .clientId(provider.clientId())
                        .clientSecret(provider.clientSecret())
                        .clientAuthenticationMethod(
                                ClientAuthenticationMethod.CLIENT_SECRET_POST
                        )
                        .authorizationGrantType(
                                AuthorizationGrantType.AUTHORIZATION_CODE
                        )
                        .redirectUri(REDIRECT_URI_TEMPLATE)
                        .scope("openid", "profile", "email")
                        .authorizationUri(
                                "https://www.linkedin.com/oauth/v2/authorization"
                        )
                        .tokenUri(
                                "https://www.linkedin.com/oauth/v2/accessToken"
                        )
                        .userInfoUri(
                                "https://api.linkedin.com/v2/userinfo"
                        )
                        .userNameAttributeName(
                                IdTokenClaimNames.SUB
                        )
                        .clientName("LinkedIn")
                        .build()
        );
    }
}
