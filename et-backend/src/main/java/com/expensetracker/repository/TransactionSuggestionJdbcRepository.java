package com.expensetracker.repository;

import com.expensetracker.dto.TransactionSuggestionResponse;
import com.expensetracker.entity.TransactionType;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.RoundingMode;
import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Repository
public class TransactionSuggestionJdbcRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public TransactionSuggestionJdbcRepository(
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

    public List<TransactionSuggestionResponse>
    findSuggestions(
            long userId,
            TransactionType transactionType,
            String query,
            int limit
    ) {
        String normalizedQuery =
                normalizeQuery(query);

        String searchPattern =
                normalizedQuery == null
                        ? null
                        : "%"
                        + normalizedQuery
                        + "%";

        String prefixPattern =
                normalizedQuery == null
                        ? null
                        : normalizedQuery
                        + "%";

        String sql = """
                SELECT
                    ft.transaction_type,
                    ft.merchant_name,
                    MAX(ft.description) AS description,
                    ROUND(AVG(ft.amount), 2) AS suggested_amount,
                    ft.currency_code,
                    fa.public_id AS account_public_id,
                    fa.name AS account_name,
                    tc.public_id AS category_public_id,
                    tc.name AS category_name,
                    COUNT(ft.id) AS usage_count,
                    MAX(ft.transaction_date) AS last_used_date

                FROM financial_transactions ft

                INNER JOIN financial_accounts fa
                    ON fa.id = ft.account_id

                LEFT JOIN transaction_categories tc
                    ON tc.id = ft.category_id

                WHERE ft.user_id = :userId
                  AND ft.transaction_status = 'POSTED'
                  AND ft.transaction_type <> 'TRANSFER'
                  AND ft.merchant_name IS NOT NULL
                  AND TRIM(ft.merchant_name) <> ''
                  AND (
                      :transactionType IS NULL
                      OR ft.transaction_type = :transactionType
                  )
                  AND (
                      :searchPattern IS NULL
                      OR LOWER(ft.merchant_name) LIKE :searchPattern
                      OR LOWER(COALESCE(ft.description, '')) LIKE :searchPattern
                      OR LOWER(COALESCE(tc.name, '')) LIKE :searchPattern
                  )

                GROUP BY
                    ft.transaction_type,
                    ft.merchant_name,
                    ft.currency_code,
                    fa.public_id,
                    fa.name,
                    tc.public_id,
                    tc.name

                ORDER BY
                    CASE
                        WHEN :prefixPattern IS NOT NULL
                         AND LOWER(ft.merchant_name) LIKE :prefixPattern
                            THEN 0
                        ELSE 1
                    END ASC,
                    usage_count DESC,
                    last_used_date DESC,
                    ft.merchant_name ASC

                LIMIT :limit
                """;

        MapSqlParameterSource parameters =
                new MapSqlParameterSource()
                        .addValue(
                                "userId",
                                userId
                        )
                        .addValue(
                                "transactionType",
                                transactionType == null
                                        ? null
                                        : transactionType.name()
                        )
                        .addValue(
                                "searchPattern",
                                searchPattern
                        )
                        .addValue(
                                "prefixPattern",
                                prefixPattern
                        )
                        .addValue(
                                "limit",
                                limit
                        );

        return jdbcTemplate.query(
                sql,
                parameters,
                (resultSet, rowNumber) ->
                        new TransactionSuggestionResponse(
                                TransactionType.valueOf(
                                        resultSet.getString(
                                                "transaction_type"
                                        )
                                ),
                                resultSet.getString(
                                        "merchant_name"
                                ),
                                resultSet.getString(
                                        "description"
                                ),
                                resultSet.getBigDecimal(
                                                "suggested_amount"
                                        )
                                        .setScale(
                                                2,
                                                RoundingMode.HALF_UP
                                        ),
                                resultSet.getString(
                                        "currency_code"
                                ),
                                resultSet.getString(
                                        "account_public_id"
                                ),
                                resultSet.getString(
                                        "account_name"
                                ),
                                resultSet.getString(
                                        "category_public_id"
                                ),
                                resultSet.getString(
                                        "category_name"
                                ),
                                resultSet.getLong(
                                        "usage_count"
                                ),
                                toLocalDate(
                                        resultSet.getDate(
                                                "last_used_date"
                                        )
                                )
                        )
        );
    }

    private LocalDate toLocalDate(
            Date date
    ) {
        return date == null
                ? null
                : date.toLocalDate();
    }

    private String normalizeQuery(
            String query
    ) {
        if (
                query == null
                || query.isBlank()
        ) {
            return null;
        }

        return query
                .trim()
                .toLowerCase(Locale.ROOT);
    }
}