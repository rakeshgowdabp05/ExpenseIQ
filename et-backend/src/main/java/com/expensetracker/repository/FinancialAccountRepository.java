package com.expensetracker.repository;

import com.expensetracker.entity.FinancialAccount;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface FinancialAccountRepository
        extends JpaRepository<FinancialAccount, Long> {

    List<FinancialAccount>
    findAllByUserIdOrderByCreatedAtDesc(Long userId);

    List<FinancialAccount>
    findAllByUserIdAndActiveOrderByCreatedAtDesc(
            Long userId,
            boolean active
    );

    Optional<FinancialAccount>
    findByPublicIdAndUserId(
            String publicId,
            Long userId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT account
            FROM FinancialAccount account
            WHERE account.user.id = :userId
            AND account.publicId IN :publicIds
            ORDER BY account.id ASC
            """)
    List<FinancialAccount>
    findOwnedByPublicIdsForUpdate(
            @Param("userId")
            Long userId,

            @Param("publicIds")
            Collection<String> publicIds
    );

    boolean existsByUserIdAndNameIgnoreCase(
            Long userId,
            String name
    );

    boolean existsByUserIdAndNameIgnoreCaseAndIdNot(
            Long userId,
            String name,
            Long accountId
    );
}