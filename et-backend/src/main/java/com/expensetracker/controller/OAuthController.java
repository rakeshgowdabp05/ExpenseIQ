package com.expensetracker.controller;

import com.expensetracker.common.ApiResponse;
import com.expensetracker.common.ApiResponseFactory;
import com.expensetracker.common.ApplicationMessages;
import com.expensetracker.config.OAuthProperties;
import com.expensetracker.config.OAuthSessionConstants;
import com.expensetracker.dto.LoginResponse;
import com.expensetracker.dto.OAuthCodeExchangeRequest;
import com.expensetracker.service.OAuthLoginCodeService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Locale;

@RestController
@RequestMapping("/api/v1/auth/oauth")
public class OAuthController {

    private static final int LOCATION_SCALE = 5;

    private final OAuthProperties oauthProperties;
    private final OAuthLoginCodeService loginCodeService;
    private final ApiResponseFactory responseFactory;

    public OAuthController(
            OAuthProperties oauthProperties,
            OAuthLoginCodeService loginCodeService,
            ApiResponseFactory responseFactory
    ) {
        this.oauthProperties = oauthProperties;
        this.loginCodeService = loginCodeService;
        this.responseFactory = responseFactory;
    }

    @GetMapping("/start/{provider}")
    public void start(
            @PathVariable String provider,
            @RequestParam(required = false) BigDecimal latitude,
            @RequestParam(required = false) BigDecimal longitude,
            @RequestParam(required = false) String timezone,
            @RequestParam(required = false) String locationSource,
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {
        String registrationId = provider
                .trim()
                .toLowerCase(Locale.ROOT);

        if (!oauthProperties.provider(registrationId).configured()) {
            redirectWithError(
                    response,
                    "This social provider is not configured yet."
            );
            return;
        }

        HttpSession session = request.getSession(true);

        if (isValidCoordinatePair(latitude, longitude)) {
            session.setAttribute(
                    OAuthSessionConstants.LATITUDE,
                    latitude.setScale(LOCATION_SCALE, RoundingMode.HALF_UP)
            );
            session.setAttribute(
                    OAuthSessionConstants.LONGITUDE,
                    longitude.setScale(LOCATION_SCALE, RoundingMode.HALF_UP)
            );
        }

        if (timezone != null && !timezone.isBlank()) {
            session.setAttribute(
                    OAuthSessionConstants.TIMEZONE,
                    timezone.trim()
            );
        }

        if (locationSource != null && !locationSource.isBlank()) {
            session.setAttribute(
                    OAuthSessionConstants.LOCATION_SOURCE,
                    locationSource.trim()
            );
        }

        response.sendRedirect(
                "/oauth2/authorization/" + registrationId
        );
    }

    @PostMapping("/exchange")
    public ResponseEntity<ApiResponse<LoginResponse>> exchange(
            @Valid @RequestBody OAuthCodeExchangeRequest request,
            HttpServletRequest httpRequest
    ) {
        LoginResponse loginResponse = loginCodeService.exchange(
                request.code(),
                request.deviceName(),
                httpRequest.getRemoteAddr(),
                httpRequest.getHeader("User-Agent")
        );

        return ResponseEntity.ok(
                responseFactory.success(
                        ApplicationMessages.LOGIN_SUCCESS,
                        loginResponse
                )
        );
    }

    private boolean isValidCoordinatePair(
            BigDecimal latitude,
            BigDecimal longitude
    ) {
        return latitude != null
                && longitude != null
                && latitude.compareTo(BigDecimal.valueOf(-90)) >= 0
                && latitude.compareTo(BigDecimal.valueOf(90)) <= 0
                && longitude.compareTo(BigDecimal.valueOf(-180)) >= 0
                && longitude.compareTo(BigDecimal.valueOf(180)) <= 0;
    }

    private void redirectWithError(
            HttpServletResponse response,
            String message
    ) throws IOException {
        String redirectUrl = UriComponentsBuilder
                .fromUriString(oauthProperties.frontendBaseUrl())
                .path("/login")
                .queryParam("oauthError", message)
                .build()
                .encode()
                .toUriString();

        response.sendRedirect(redirectUrl);
    }
}
