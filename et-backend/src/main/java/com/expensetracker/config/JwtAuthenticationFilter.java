package com.expensetracker.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    private final JwtTokenService jwtTokenService;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtTokenService jwtTokenService,
            UserDetailsService userDetailsService
    ) {
        this.jwtTokenService = jwtTokenService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorizationHeader =
                request.getHeader(
                        SecurityConstants.AUTHORIZATION_HEADER
                );

        if (authorizationHeader == null
                || !authorizationHeader.startsWith(
                        SecurityConstants.BEARER_PREFIX
                )) {

            filterChain.doFilter(request, response);
            return;
        }

        String accessToken =
                authorizationHeader.substring(
                        SecurityConstants.BEARER_PREFIX.length()
                ).trim();

        if (accessToken.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            Claims claims =
                    jwtTokenService.parseAccessToken(
                            accessToken
                    );

            String email = claims.get(
                    SecurityConstants.EMAIL_CLAIM,
                    String.class
            );

            if (email != null
                    && SecurityContextHolder
                    .getContext()
                    .getAuthentication() == null) {

                UserDetails userDetails =
                        userDetailsService
                                .loadUserByUsername(email);

                UsernamePasswordAuthenticationToken
                        authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );

                SecurityContext securityContext =
                        SecurityContextHolder
                                .createEmptyContext();

                securityContext.setAuthentication(
                        authentication
                );

                SecurityContextHolder.setContext(
                        securityContext
                );
            }
        } catch (
                JwtException
                | IllegalArgumentException
                | UsernameNotFoundException exception
        ) {
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}