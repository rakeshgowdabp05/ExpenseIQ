package com.expensetracker.config;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class SecureTokenService {

    private static final int REFRESH_TOKEN_BYTE_LENGTH = 64;
    private static final String HASH_ALGORITHM = "SHA-256";

    private final SecureRandom secureRandom =
            new SecureRandom();

    public String generateRefreshToken() {
        byte[] randomBytes =
                new byte[REFRESH_TOKEN_BYTE_LENGTH];

        secureRandom.nextBytes(randomBytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);
    }

    public String hashToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new IllegalArgumentException(
                    "Token must not be empty."
            );
        }

        try {
            MessageDigest messageDigest =
                    MessageDigest.getInstance(HASH_ALGORITHM);

            byte[] hash = messageDigest.digest(
                    rawToken.getBytes(StandardCharsets.UTF_8)
            );

            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(
                    "Required token hashing algorithm is unavailable.",
                    exception
            );
        }
    }
}