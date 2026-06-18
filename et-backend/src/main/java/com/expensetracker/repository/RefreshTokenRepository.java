package com.expensetracker.repository;

import com.expensetracker.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository
        extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken>
    findByTokenHash(
            String tokenHash
    );

    Optional<RefreshToken>
    findByPublicId(
            String publicId
    );

    Optional<RefreshToken>
    findByPublicIdAndUserId(
            String publicId,
            Long userId
    );

    List<RefreshToken>
    findAllByUserIdAndRevokedAtIsNullAndExpiresAtAfter(
            Long userId,
            Instant currentTime
    );

    List<RefreshToken>
    findAllByUserIdAndRevokedAtIsNullAndExpiresAtAfterOrderByIssuedAtDesc(
            Long userId,
            Instant currentTime
    );

    long deleteByExpiresAtBefore(
            Instant currentTime
    );
}