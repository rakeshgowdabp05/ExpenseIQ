package com.expensetracker.config;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.Clock;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@EnableConfigurationProperties({
        JwtProperties.class,
        PasswordProperties.class,
        CorsProperties.class,
        OAuthProperties.class
})
public class SecurityConfiguration {

    private final PasswordProperties passwordProperties;
    private final CorsProperties corsProperties;

    public SecurityConfiguration(
            PasswordProperties passwordProperties,
            CorsProperties corsProperties
    ) {
        this.passwordProperties = passwordProperties;
        this.corsProperties = corsProperties;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(
                passwordProperties.bcryptStrength()
        );
    }

    @Bean
    public AuthenticationManager authenticationManager(
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder
    ) {
        DaoAuthenticationProvider authenticationProvider =
                new DaoAuthenticationProvider(userDetailsService);

        authenticationProvider.setPasswordEncoder(passwordEncoder);

        return new ProviderManager(authenticationProvider);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            OAuthAuthenticationSuccessHandler oauthSuccessHandler,
            OAuthAuthenticationFailureHandler oauthFailureHandler,
            OAuthProperties oauthProperties
    ) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.IF_REQUIRED
                        )
                )
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .exceptionHandling(exceptionHandling ->
                        exceptionHandling
                                .authenticationEntryPoint(
                                        (request, response, exception) ->
                                                response.sendError(
                                                        HttpServletResponse.SC_UNAUTHORIZED,
                                                        "Authentication required."
                                                )
                                )
                                .accessDeniedHandler(
                                        (request, response, exception) ->
                                                response.sendError(
                                                        HttpServletResponse.SC_FORBIDDEN,
                                                        "Access denied."
                                                )
                                )
                )
                .authorizeHttpRequests(authorize ->
                        authorize
                                .requestMatchers(
                                        SecurityConstants.REGISTER_PATH,
                                        SecurityConstants.LOGIN_PATH,
                                        SecurityConstants.REFRESH_PATH,
                                        SecurityConstants.LOGOUT_PATH,
                                        SecurityConstants.OAUTH_API_PATH_PATTERN,
                                        SecurityConstants.OAUTH2_PATH_PATTERN,
                                        SecurityConstants.OAUTH2_CALLBACK_PATH_PATTERN,
                                        SecurityConstants.ACTUATOR_HEALTH_PATH
                                )
                                .permitAll()
                                .requestMatchers(
                                        SecurityConstants.ACTUATOR_PATH_PATTERN
                                )
                                .hasRole("ADMIN")
                                .anyRequest()
                                .authenticated()
                )
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        if (oauthProperties.anyConfigured()) {
            http.oauth2Login(oauth -> oauth
                    .successHandler(oauthSuccessHandler)
                    .failureHandler(oauthFailureHandler)
            );
        }

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(corsProperties.allowedOrigins());
        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );
        configuration.setAllowedHeaders(
                List.of(
                        SecurityConstants.AUTHORIZATION_HEADER,
                        "Content-Type",
                        "Accept"
                )
        );
        configuration.setExposedHeaders(
                List.of(SecurityConstants.AUTHORIZATION_HEADER)
        );
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    @Bean
    public Clock applicationClock() {
        return Clock.systemUTC();
    }
}
