package com.expensetracker.repository;

import com.expensetracker.entity.GoalStatus;
import com.expensetracker.entity.SavingsGoal;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SavingsGoalRepository
        extends JpaRepository<SavingsGoal, Long> {

    @Query("""
            SELECT goal
            FROM SavingsGoal goal
            WHERE goal.user.id = :userId
            AND goal.status <> :archivedStatus
            ORDER BY
                goal.targetDate ASC,
                goal.createdAt DESC,
                goal.id DESC
            """)
    List<SavingsGoal> findVisibleGoals(
            @Param("userId")
            Long userId,

            @Param("archivedStatus")
            GoalStatus archivedStatus
    );

    Optional<SavingsGoal>
    findByPublicIdAndUserIdAndStatusNot(
            String publicId,
            Long userId,
            GoalStatus archivedStatus
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT goal
            FROM SavingsGoal goal
            WHERE goal.publicId = :publicId
            AND goal.user.id = :userId
            AND goal.status <> :archivedStatus
            """)
    Optional<SavingsGoal> findOwnedByPublicIdForUpdate(
            @Param("publicId")
            String publicId,

            @Param("userId")
            Long userId,

            @Param("archivedStatus")
            GoalStatus archivedStatus
    );

    @Query("""
            SELECT CASE
                WHEN COUNT(goal) > 0
                    THEN true
                ELSE false
            END
            FROM SavingsGoal goal
            WHERE goal.user.id = :userId
            AND goal.status <> :archivedStatus
            AND LOWER(goal.name) = LOWER(:name)
            """)
    boolean existsVisibleByName(
            @Param("userId")
            Long userId,

            @Param("name")
            String name,

            @Param("archivedStatus")
            GoalStatus archivedStatus
    );

    @Query("""
            SELECT CASE
                WHEN COUNT(goal) > 0
                    THEN true
                ELSE false
            END
            FROM SavingsGoal goal
            WHERE goal.user.id = :userId
            AND goal.status <> :archivedStatus
            AND LOWER(goal.name) = LOWER(:name)
            AND goal.id <> :excludedId
            """)
    boolean existsVisibleByNameExcludingId(
            @Param("userId")
            Long userId,

            @Param("name")
            String name,

            @Param("archivedStatus")
            GoalStatus archivedStatus,

            @Param("excludedId")
            Long excludedId
    );
}