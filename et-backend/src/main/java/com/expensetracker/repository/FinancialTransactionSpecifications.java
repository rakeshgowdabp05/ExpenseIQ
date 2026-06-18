package com.expensetracker.repository;

import com.expensetracker.entity.FinancialTransaction;
import com.expensetracker.entity.TransactionStatus;
import com.expensetracker.entity.TransactionType;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.Locale;

public final class FinancialTransactionSpecifications {

    private FinancialTransactionSpecifications() {
        throw new IllegalStateException(
                "FinancialTransactionSpecifications cannot be instantiated."
        );
    }

    public static Specification<FinancialTransaction>
    belongsToUser(Long userId) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        root.get("user").get("id"),
                        userId
                );
    }

    public static Specification<FinancialTransaction>
    hasType(TransactionType transactionType) {
        if (transactionType == null) {
            return null;
        }

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        root.get("transactionType"),
                        transactionType
                );
    }

    public static Specification<FinancialTransaction>
    hasStatus(TransactionStatus transactionStatus) {
        if (transactionStatus == null) {
            return null;
        }

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        root.get("transactionStatus"),
                        transactionStatus
                );
    }

    public static Specification<FinancialTransaction>
    involvesAccount(String accountPublicId) {
        if (isBlank(accountPublicId)) {
            return null;
        }

        String normalizedPublicId =
                accountPublicId.trim();

        return (root, query, criteriaBuilder) -> {
            var destinationAccount = root.join(
                    "destinationAccount",
                    JoinType.LEFT
            );

            return criteriaBuilder.or(
                    criteriaBuilder.equal(
                            root.get("account")
                                    .get("publicId"),
                            normalizedPublicId
                    ),
                    criteriaBuilder.equal(
                            destinationAccount
                                    .get("publicId"),
                            normalizedPublicId
                    )
            );
        };
    }

    public static Specification<FinancialTransaction>
    hasCategory(String categoryPublicId) {
        if (isBlank(categoryPublicId)) {
            return null;
        }

        String normalizedPublicId =
                categoryPublicId.trim();

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(
                        root.get("category")
                                .get("publicId"),
                        normalizedPublicId
                );
    }

    public static Specification<FinancialTransaction>
    occurredOnOrAfter(LocalDate fromDate) {
        if (fromDate == null) {
            return null;
        }

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.greaterThanOrEqualTo(
                        root.get("transactionDate"),
                        fromDate
                );
    }

    public static Specification<FinancialTransaction>
    occurredOnOrBefore(LocalDate toDate) {
        if (toDate == null) {
            return null;
        }

        return (root, query, criteriaBuilder) ->
                criteriaBuilder.lessThanOrEqualTo(
                        root.get("transactionDate"),
                        toDate
                );
    }

    public static Specification<FinancialTransaction>
    containsSearchText(String searchText) {
        if (isBlank(searchText)) {
            return null;
        }

        String searchPattern =
                "%" + searchText
                        .trim()
                        .toLowerCase(Locale.ROOT)
                        + "%";

        return (root, query, criteriaBuilder) -> {
            var destinationAccount = root.join(
                    "destinationAccount",
                    JoinType.LEFT
            );

            var category = root.join(
                    "category",
                    JoinType.LEFT
            );

            return criteriaBuilder.or(
                    criteriaBuilder.like(
                            criteriaBuilder.lower(
                                    root.get("merchantName")
                            ),
                            searchPattern
                    ),
                    criteriaBuilder.like(
                            criteriaBuilder.lower(
                                    root.get("description")
                            ),
                            searchPattern
                    ),
                    criteriaBuilder.like(
                            criteriaBuilder.lower(
                                    root.get("referenceNumber")
                            ),
                            searchPattern
                    ),
                    criteriaBuilder.like(
                            criteriaBuilder.lower(
                                    root.get("account")
                                            .get("name")
                            ),
                            searchPattern
                    ),
                    criteriaBuilder.like(
                            criteriaBuilder.lower(
                                    destinationAccount
                                            .get("name")
                            ),
                            searchPattern
                    ),
                    criteriaBuilder.like(
                            criteriaBuilder.lower(
                                    category.get("name")
                            ),
                            searchPattern
                    )
            );
        };
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}