package com.expensetracker.config;

import com.expensetracker.entity.Role;
import com.expensetracker.entity.User;
import com.expensetracker.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Clock;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class JwtTokenService {

    private final JwtProperties jwtProperties;
    private final Clock clock;
    private final SecretKey signingKey;

    public JwtTokenService(
            JwtProperties jwtProperties,
            Clock clock
    ) {
        this.jwtProperties = jwtProperties;
        this.clock = clock;

        this.signingKey = Keys.hmacShaKeyFor(
                Decoders.BASE64.decode(
                        jwtProperties.secret()
                )
        );
    }

    public IssuedAccessToken issueAccessToken(User user) {
        Instant issuedAt = clock.instant();

        Instant expiresAt = issuedAt.plusMillis(
                jwtProperties.accessTokenExpirationMs()
        );

        List<String> roles = user.getRoles()
                .stream()
                .filter(Role::isActive)
                .map(role -> role.getCode().name())
                .sorted()
                .toList();

        String token = Jwts.builder()
                .id(UUID.randomUUID().toString())
                .issuer(jwtProperties.issuer())
                .subject(user.getPublicId())
                .claim(
                        SecurityConstants.EMAIL_CLAIM,
                        user.getEmail()
                )
                .claim(
                        SecurityConstants.ROLES_CLAIM,
                        roles
                )
                .claim(
                        SecurityConstants.TOKEN_TYPE_CLAIM,
                        SecurityConstants.ACCESS_TOKEN_TYPE
                )
                .issuedAt(Date.from(issuedAt))
                .expiration(Date.from(expiresAt))
                .signWith(signingKey)
                .compact();

        return new IssuedAccessToken(
                token,
                expiresAt
        );
    }

    public Claims parseAccessToken(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .requireIssuer(jwtProperties.issuer())
                .require(
                        SecurityConstants.TOKEN_TYPE_CLAIM,
                        SecurityConstants.ACCESS_TOKEN_TYPE
                )
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractUserPublicId(String token) {
        return parseAccessToken(token).getSubject();
    }

    public long getAccessTokenExpirationMs() {
        return jwtProperties.accessTokenExpirationMs();
    }

    public long getRefreshTokenExpirationMs() {
        return jwtProperties.refreshTokenExpirationMs();
    }

    public record IssuedAccessToken(
            String token,
            Instant expiresAt
    ) {
    }
}