package com.expensetracker.repository;

import com.expensetracker.entity.BudgetPeriodType;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class BudgetJdbcRepository {

    private static final String BUDGET_SELECT = """
            SELECT
                b.id,
                b.public_id,
                b.user_id,
                b.category_id,
                b.name,
                b.limit_amount,
                b.currency_code,
                b.period_type,
                b.start_date,
                b.end_date,
                b.warning_threshold,
                b.active,
                b.archived,
                b.version,
                b.created_at,
                b.updated_at,
                c.public_id AS category_public_id,
                c.name AS category_name,
                COALESCE(
                    (
                        SELECT SUM(ft.amount)
                        FROM financial_transactions ft
                        WHERE ft.user_id = b.user_id
                          AND ft.transaction_type = 'EXPENSE'
                          AND ft.transaction_status = 'POSTED'
                          AND ft.currency_code = b.currency_code
                          AND ft.transaction_date >= b.start_date
                          AND ft.transaction_date <= b.end_date
                          AND (
                              :spentPeriodStart IS NULL
                              OR ft.transaction_date >= :spentPeriodStart
                          )
                          AND (
                              :spentPeriodEnd IS NULL
                              OR ft.transaction_date <= :spentPeriodEnd
                          )
                          AND (
                              b.category_id IS NULL
                              OR ft.category_id = b.category_id
                          )
                    ),
                    0.00
                ) AS spent_amount
            FROM budgets b
            LEFT JOIN transaction_categories c
                ON c.id = b.category_id
            """;

    private static final RowMapper<BudgetRecord>
            BUDGET_ROW_MAPPER =
            BudgetJdbcRepository::mapBudget;

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public BudgetJdbcRepository(
            NamedParameterJdbcTemplate jdbcTemplate
    ) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public Optional<Long> findUserIdByEmail(
            String email
    ) {
        String sql = """
                SELECT id
                FROM users
                WHERE LOWER(email) = LOWER(:email)
                LIMIT 1
                """;

        List<Long> results =
                jdbcTemplate.query(
                        sql,
                        new MapSqlParameterSource(
                                "email",
                                email
                        ),
                        (resultSet, rowNumber) ->
                                resultSet.getLong("id")
                );

        return results.stream().findFirst();
    }

    public Optional<CategoryRecord> findExpenseCategory(
            long userId,
            String categoryPublicId
    ) {
        String sql = """
                SELECT
                    id,
                    public_id,
                    name,
                    category_type,
                    active,
                    system_defined
                FROM transaction_categories
                WHERE public_id = :publicId
                  AND (
                      system_defined = TRUE
                      OR user_id = :userId
                  )
                LIMIT 1
                """;

        MapSqlParameterSource parameters =
                new MapSqlParameterSource()
                        .addValue(
                                "publicId",
                                categoryPublicId
                        )
                        .addValue(
                                "userId",
                                userId
                        );

        List<CategoryRecord> results =
                jdbcTemplate.query(
                        sql,
                        parameters,
                        (resultSet, rowNumber) ->
                                new CategoryRecord(
                                        resultSet.getLong("id"),
                                        resultSet.getString("public_id"),
                                        resultSet.getString("name"),
                                        resultSet.getString("category_type"),
                                        resultSet.getBoolean("active"),
                                        resultSet.getBoolean("system_defined")
                                )
                );

        return results.stream().findFirst();
    }

    public boolean existsOverlappingBudget(
            long userId,
            Long categoryId,
            String currencyCode,
            LocalDate startDate,
            LocalDate endDate,
            Long excludedBudgetId
    ) {
        String sql = """
                SELECT COUNT(*)
                FROM budgets
                WHERE user_id = :userId
                  AND archived = FALSE
                  AND active = TRUE
                  AND currency_code = :currencyCode
                  AND start_date <= :endDate
                  AND end_date >= :startDate
                  AND (
                      (
                          category_id IS NULL
                          AND :categoryId IS NULL
                      )
                      OR category_id = :categoryId
                  )
                  AND (
                      :excludedBudgetId IS NULL
                      OR id <> :excludedBudgetId
                  )
                """;

        MapSqlParameterSource parameters =
                new MapSqlParameterSource()
                        .addValue(
                                "userId",
                                userId
                        )
                        .addValue(
                                "categoryId",
                                categoryId
                        )
                        .addValue(
                                "currencyCode",
                                currencyCode
                        )
                        .addValue(
                                "startDate",
                                startDate,
                                Types.DATE
                        )
                        .addValue(
                                "endDate",
                                endDate,
                                Types.DATE
                        )
                        .addValue(
                                "excludedBudgetId",
                                excludedBudgetId
                        );

        Long count =
                jdbcTemplate.queryForObject(
                        sql,
                        parameters,
                        Long.class
                );

        return count != null && count > 0;
    }

    public String insert(
            long userId,
            Long categoryId,
            String name,
            BigDecimal limitAmount,
            String currencyCode,
            BudgetPeriodType periodType,
            LocalDate startDate,
            LocalDate endDate,
            int warningThreshold
    ) {
        String publicId =
                UUID.randomUUID().toString();

        String sql = """
                INSERT INTO budgets (
                    public_id,
                    user_id,
                    category_id,
                    name,
                    limit_amount,
                    currency_code,
                    period_type,
                    start_date,
                    end_date,
                    warning_threshold,
                    active,
                    archived,
                    version
                )
                VALUES (
                    :publicId,
                    :userId,
                    :categoryId,
                    :name,
                    :limitAmount,
                    :currencyCode,
                    :periodType,
                    :startDate,
                    :endDate,
                    :warningThreshold,
                    TRUE,
                    FALSE,
                    0
                )
                """;

        MapSqlParameterSource parameters =
                new MapSqlParameterSource()
                        .addValue(
                                "publicId",
                                publicId
                        )
                        .addValue(
                                "userId",
                                userId
                        )
                        .addValue(
                                "categoryId",
                                categoryId
                        )
                        .addValue(
                                "name",
                                name
                        )
                        .addValue(
                                "limitAmount",
                                limitAmount
                        )
                        .addValue(
                                "currencyCode",
                                currencyCode
                        )
                        .addValue(
                                "periodType",
                                periodType.name()
                        )
                        .addValue(
                                "startDate",
                                startDate,
                                Types.DATE
                        )
                        .addValue(
                                "endDate",
                                endDate,
                                Types.DATE
                        )
                        .addValue(
                                "warningThreshold",
                                warningThreshold
                        );

        jdbcTemplate.update(
                sql,
                parameters
        );

        return publicId;
    }

    public Optional<BudgetRecord> findByPublicId(
            long userId,
            String publicId
    ) {
        String sql = BUDGET_SELECT + """
                WHERE b.user_id = :userId
                  AND b.public_id = :publicId
                  AND b.archived = FALSE
                LIMIT 1
                """;

        MapSqlParameterSource parameters =
                new MapSqlParameterSource()
                        .addValue(
                                "userId",
                                userId
                        )
                        .addValue(
                                "publicId",
                                publicId
                        );

        addUsageWindowParameters(
                parameters,
                null,
                null
        );

        List<BudgetRecord> results =
                jdbcTemplate.query(
                        sql,
                        parameters,
                        BUDGET_ROW_MAPPER
                );

        return results.stream().findFirst();
    }

    public List<BudgetRecord> findAll(
            long userId,
            LocalDate periodStart,
            LocalDate periodEnd,
            Boolean active
    ) {
        StringBuilder sql =
                new StringBuilder(
                        BUDGET_SELECT
                );

        sql.append("""
                WHERE b.user_id = :userId
                  AND b.archived = FALSE
                """);

        MapSqlParameterSource parameters =
                new MapSqlParameterSource()
                        .addValue(
                                "userId",
                                userId
                        );

        addUsageWindowParameters(
                parameters,
                periodStart,
                periodEnd
        );

        if (
                periodStart != null
                && periodEnd != null
        ) {
            sql.append("""
                      AND b.start_date <= :periodEnd
                      AND b.end_date >= :periodStart
                    """);

            parameters
                    .addValue(
                            "periodStart",
                            periodStart,
                            Types.DATE
                    )
                    .addValue(
                            "periodEnd",
                            periodEnd,
                            Types.DATE
                    );
        }

        if (active != null) {
            sql.append("""
                      AND b.active = :active
                    """);

            parameters.addValue(
                    "active",
                    active
            );
        }

        sql.append("""
                ORDER BY
                    b.start_date DESC,
                    b.created_at DESC,
                    b.id DESC
                """);

        return jdbcTemplate.query(
                sql.toString(),
                parameters,
                BUDGET_ROW_MAPPER
        );
    }

    public int update(
            long userId,
            String publicId,
            Long categoryId,
            String name,
            BigDecimal limitAmount,
            String currencyCode,
            BudgetPeriodType periodType,
            LocalDate startDate,
            LocalDate endDate,
            int warningThreshold
    ) {
        String sql = """
                UPDATE budgets
                SET
                    category_id = :categoryId,
                    name = :name,
                    limit_amount = :limitAmount,
                    currency_code = :currencyCode,
                    period_type = :periodType,
                    start_date = :startDate,
                    end_date = :endDate,
                    warning_threshold = :warningThreshold,
                    version = version + 1
                WHERE user_id = :userId
                  AND public_id = :publicId
                  AND archived = FALSE
                """;

        MapSqlParameterSource parameters =
                new MapSqlParameterSource()
                        .addValue(
                                "userId",
                                userId
                        )
                        .addValue(
                                "publicId",
                                publicId
                        )
                        .addValue(
                                "categoryId",
                                categoryId
                        )
                        .addValue(
                                "name",
                                name
                        )
                        .addValue(
                                "limitAmount",
                                limitAmount
                        )
                        .addValue(
                                "currencyCode",
                                currencyCode
                        )
                        .addValue(
                                "periodType",
                                periodType.name()
                        )
                        .addValue(
                                "startDate",
                                startDate,
                                Types.DATE
                        )
                        .addValue(
                                "endDate",
                                endDate,
                                Types.DATE
                        )
                        .addValue(
                                "warningThreshold",
                                warningThreshold
                        );

        return jdbcTemplate.update(
                sql,
                parameters
        );
    }

    public int updateActiveStatus(
            long userId,
            String publicId,
            boolean active
    ) {
        String sql = """
                UPDATE budgets
                SET
                    active = :active,
                    version = version + 1
                WHERE user_id = :userId
                  AND public_id = :publicId
                  AND archived = FALSE
                """;

        return jdbcTemplate.update(
                sql,
                new MapSqlParameterSource()
                        .addValue(
                                "userId",
                                userId
                        )
                        .addValue(
                                "publicId",
                                publicId
                        )
                        .addValue(
                                "active",
                                active
                        )
        );
    }

    public int archive(
            long userId,
            String publicId
    ) {
        String sql = """
                UPDATE budgets
                SET
                    active = FALSE,
                    archived = TRUE,
                    version = version + 1
                WHERE user_id = :userId
                  AND public_id = :publicId
                  AND archived = FALSE
                """;

        return jdbcTemplate.update(
                sql,
                new MapSqlParameterSource()
                        .addValue(
                                "userId",
                                userId
                        )
                        .addValue(
                                "publicId",
                                publicId
                        )
        );
    }

    private static void addUsageWindowParameters(
            MapSqlParameterSource parameters,
            LocalDate spentPeriodStart,
            LocalDate spentPeriodEnd
    ) {
        parameters
                .addValue(
                        "spentPeriodStart",
                        spentPeriodStart,
                        Types.DATE
                )
                .addValue(
                        "spentPeriodEnd",
                        spentPeriodEnd,
                        Types.DATE
                );
    }

    private static BudgetRecord mapBudget(
            ResultSet resultSet,
            int rowNumber
    ) throws SQLException {

        Object categoryIdValue =
                resultSet.getObject(
                        "category_id"
                );

        Long categoryId =
                categoryIdValue == null
                        ? null
                        : resultSet.getLong(
                                "category_id"
                        );

        return new BudgetRecord(
                resultSet.getLong("id"),
                resultSet.getString("public_id"),
                resultSet.getLong("user_id"),
                categoryId,
                resultSet.getString(
                        "category_public_id"
                ),
                resultSet.getString(
                        "category_name"
                ),
                resultSet.getString("name"),
                resultSet.getBigDecimal(
                        "limit_amount"
                ),
                resultSet.getBigDecimal(
                        "spent_amount"
                ),
                resultSet.getString(
                        "currency_code"
                ),
                BudgetPeriodType.valueOf(
                        resultSet.getString(
                                "period_type"
                        )
                ),
                resultSet
                        .getDate("start_date")
                        .toLocalDate(),
                resultSet
                        .getDate("end_date")
                        .toLocalDate(),
                resultSet.getInt(
                        "warning_threshold"
                ),
                resultSet.getBoolean("active"),
                resultSet.getBoolean("archived"),
                resultSet.getLong("version"),
                resultSet
                        .getTimestamp("created_at")
                        .toInstant(),
                resultSet
                        .getTimestamp("updated_at")
                        .toInstant()
        );
    }

    public record CategoryRecord(
            long id,
            String publicId,
            String name,
            String categoryType,
            boolean active,
            boolean systemDefined
    ) {
    }

    public record BudgetRecord(
            long id,
            String publicId,
            long userId,
            Long categoryId,
            String categoryPublicId,
            String categoryName,
            String name,
            BigDecimal limitAmount,
            BigDecimal spentAmount,
            String currencyCode,
            BudgetPeriodType periodType,
            LocalDate startDate,
            LocalDate endDate,
            int warningThreshold,
            boolean active,
            boolean archived,
            long version,
            Instant createdAt,
            Instant updatedAt
    ) {
    }
}