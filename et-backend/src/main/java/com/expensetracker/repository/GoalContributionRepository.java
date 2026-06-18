package com.expensetracker.repository;

import com.expensetracker.entity.GoalContribution;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GoalContributionRepository
        extends JpaRepository<
                GoalContribution,
                Long
        > {

    @EntityGraph(
            attributePaths = {
                    "goal",
                    "sourceAccount"
            }
    )
    @Query("""
            SELECT contribution
            FROM GoalContribution contribution
            WHERE contribution.user.id = :userId
            AND contribution.goal.id = :goalId
            ORDER BY
                contribution.contributionDate DESC,
                contribution.createdAt DESC,
                contribution.id DESC
            """)
    List<GoalContribution> findGoalContributions(
            @Param("userId")
            Long userId,

            @Param("goalId")
            Long goalId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT contribution
            FROM GoalContribution contribution
            WHERE contribution.publicId =
                :contributionPublicId
            AND contribution.goal.publicId =
                :goalPublicId
            AND contribution.user.id = :userId
            """)
    Optional<GoalContribution>
    findOwnedContributionForUpdate(
            @Param("contributionPublicId")
            String contributionPublicId,

            @Param("goalPublicId")
            String goalPublicId,

            @Param("userId")
            Long userId
    );
}