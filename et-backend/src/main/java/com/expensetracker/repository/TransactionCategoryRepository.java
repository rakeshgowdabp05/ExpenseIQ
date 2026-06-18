package com.expensetracker.repository;

import com.expensetracker.entity.TransactionCategory;
import com.expensetracker.entity.CategoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TransactionCategoryRepository
        extends JpaRepository<
        TransactionCategory,
        Long
        > {

    @Query("""
            SELECT category
            FROM TransactionCategory category
            WHERE (
                category.systemDefined = true
                OR category.user.id = :userId
            )
            AND (
                :categoryType IS NULL
                OR category.categoryType = :categoryType
            )
            AND (
                :active IS NULL
                OR category.active = :active
            )
            ORDER BY
                category.categoryType ASC,
                category.systemDefined DESC,
                category.name ASC
            """)
    List<TransactionCategory> findVisibleCategories(
            @Param("userId")
            Long userId,

            @Param("categoryType")
            CategoryType categoryType,

            @Param("active")
            Boolean active
    );

    @Query("""
            SELECT category
            FROM TransactionCategory category
            WHERE category.publicId = :publicId
            AND (
                category.systemDefined = true
                OR category.user.id = :userId
            )
            """)
    Optional<TransactionCategory>
    findVisibleByPublicId(
            @Param("publicId")
            String publicId,

            @Param("userId")
            Long userId
    );

    @Query("""
            SELECT CASE
                WHEN COUNT(category) > 0
                    THEN true
                ELSE false
            END
            FROM TransactionCategory category
            WHERE (
                category.systemDefined = true
                OR category.user.id = :userId
            )
            AND category.categoryType = :categoryType
            AND LOWER(category.name) = LOWER(:name)
            """)
    boolean existsVisibleByName(
            @Param("userId")
            Long userId,

            @Param("categoryType")
            CategoryType categoryType,

            @Param("name")
            String name
    );

    @Query("""
            SELECT CASE
                WHEN COUNT(category) > 0
                    THEN true
                ELSE false
            END
            FROM TransactionCategory category
            WHERE (
                category.systemDefined = true
                OR category.user.id = :userId
            )
            AND category.categoryType = :categoryType
            AND LOWER(category.name) = LOWER(:name)
            AND category.id <> :excludedId
            """)
    boolean existsVisibleByNameExcludingId(
            @Param("userId")
            Long userId,

            @Param("categoryType")
            CategoryType categoryType,

            @Param("name")
            String name,

            @Param("excludedId")
            Long excludedId
    );
}