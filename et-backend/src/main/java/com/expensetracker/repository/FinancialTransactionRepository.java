package com.expensetracker.repository;

import com.expensetracker.entity.FinancialTransaction;
import com.expensetracker.entity.TransactionStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface FinancialTransactionRepository
        extends JpaRepository<
                FinancialTransaction,
                Long
        >,
        JpaSpecificationExecutor<
                FinancialTransaction
        > {

    @EntityGraph(
            attributePaths = {
                    "account",
                    "destinationAccount",
                    "category",
                    "receiptAttachment"
            }
    )
    Optional<FinancialTransaction>
    findByPublicIdAndUserId(
            String publicId,
            Long userId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT financialTransaction
            FROM FinancialTransaction financialTransaction
            WHERE financialTransaction.publicId = :publicId
            AND financialTransaction.user.id = :userId
            """)
    Optional<FinancialTransaction>
    findOwnedByPublicIdForUpdate(
            @Param("publicId")
            String publicId,

            @Param("userId")
            Long userId
    );

    @Override
    @EntityGraph(
            attributePaths = {
                    "account",
                    "destinationAccount",
                    "category",
                    "receiptAttachment"
            }
    )
    Page<FinancialTransaction> findAll(
            Specification<FinancialTransaction>
                    specification,
            Pageable pageable
    );

    @Query("""
            SELECT
                transaction.currencyCode
                    AS currencyCode,

                transaction.transactionType
                    AS transactionType,

                SUM(transaction.amount)
                    AS totalAmount,

                COUNT(transaction)
                    AS transactionCount

            FROM FinancialTransaction transaction

            WHERE transaction.user.id = :userId
            AND transaction.transactionStatus = :status
            AND transaction.transactionDate
                BETWEEN :fromDate AND :toDate

            GROUP BY
                transaction.currencyCode,
                transaction.transactionType

            ORDER BY
                transaction.currencyCode ASC,
                transaction.transactionType ASC
            """)
    List<DashboardCashFlowProjection>
    findDashboardCashFlow(
            @Param("userId")
            Long userId,

            @Param("status")
            TransactionStatus status,

            @Param("fromDate")
            LocalDate fromDate,

            @Param("toDate")
            LocalDate toDate
    );

    @Query("""
            SELECT
                transaction.transactionStatus
                    AS transactionStatus,

                COUNT(transaction)
                    AS transactionCount

            FROM FinancialTransaction transaction

            WHERE transaction.user.id = :userId

            GROUP BY transaction.transactionStatus
            """)
    List<DashboardTransactionStatusProjection>
    findDashboardTransactionStatusCounts(
            @Param("userId")
            Long userId
    );

    @EntityGraph(
            attributePaths = {
                    "account",
                    "destinationAccount",
                    "category",
                    "receiptAttachment"
            }
    )
    @Query("""
            SELECT transaction
            FROM FinancialTransaction transaction

            WHERE transaction.user.id = :userId

            ORDER BY
                transaction.transactionDate DESC,
                transaction.createdAt DESC
            """)
    List<FinancialTransaction>
    findRecentOwnedTransactions(
            @Param("userId")
            Long userId,
            Pageable pageable
    );
}