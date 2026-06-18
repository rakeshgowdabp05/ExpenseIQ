package com.expensetracker.repository;

import com.expensetracker.entity.AppNotification;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AppNotificationRepository
        extends JpaRepository<AppNotification, Long> {

    @Query("""
            SELECT notification
            FROM AppNotification notification
            WHERE notification.user.id = :userId
            AND notification.archivedAt IS NULL
            AND (
                :unreadOnly = false
                OR notification.readAt IS NULL
            )
            ORDER BY
                notification.createdAt DESC,
                notification.id DESC
            """)
    List<AppNotification> findVisible(
            @Param("userId")
            Long userId,

            @Param("unreadOnly")
            boolean unreadOnly,

            Pageable pageable
    );

    @Query("""
            SELECT notification
            FROM AppNotification notification
            WHERE notification.user.id = :userId
            AND notification.archivedAt IS NULL
            AND notification.readAt IS NULL
            ORDER BY
                notification.createdAt DESC,
                notification.id DESC
            """)
    List<AppNotification> findUnreadVisible(
            @Param("userId")
            Long userId
    );

    long countByUserIdAndArchivedAtIsNull(
            Long userId
    );

    long countByUserIdAndArchivedAtIsNullAndReadAtIsNull(
            Long userId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT notification
            FROM AppNotification notification
            WHERE notification.publicId = :publicId
            AND notification.user.id = :userId
            AND notification.archivedAt IS NULL
            """)
    Optional<AppNotification> findVisibleOwnedForUpdate(
            @Param("publicId")
            String publicId,

            @Param("userId")
            Long userId
    );

    Optional<AppNotification> findByUserIdAndDedupeKeyAndArchivedAtIsNull(
            Long userId,
            String dedupeKey
    );
}
