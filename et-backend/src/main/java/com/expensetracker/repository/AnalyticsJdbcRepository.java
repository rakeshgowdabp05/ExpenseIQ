package com.expensetracker.repository;

import com.expensetracker.entity.TransactionType;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public class AnalyticsJdbcRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public AnalyticsJdbcRepository(
            NamedParameterJdbcTemplate jdbcTemplate
    ) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<String> findCurrencies(
            long userId,
            LocalDate historyStart,
            LocalDate toDate
    ) {
        String sql = """
                SELECT currency_code
                FROM (
                    SELECT fa.currency_code
                    FROM financial_accounts fa
                    WHERE fa.user_id = :userId
                      AND fa.active = TRUE

                    UNION

                    SELECT ft.currency_code
                    FROM financial_transactions ft
                    WHERE ft.user_id = :userId
                      AND ft.transaction_status = 'POSTED'
                      AND ft.transaction_date
                          BETWEEN :historyStart AND :toDate
                ) currency_source
                ORDER BY currency_code ASC
                """;

        MapSqlParameterSource parameters =
                new MapSqlParameterSource()
                        .addValue(
                                "userId",
                                userId
                        )
                        .addValue(
                                "historyStart",
                                historyStart
                        )
                        .addValue(
                                "toDate",
                                toDate
                        );

        return jdbcTemplate.queryForList(
                sql,
                parameters,
                String.class
        );
    }

    public List<PeriodTotalRecord> findPeriodTotals(
            long userId,
            LocalDate fromDate,
            LocalDate toDate
    ) {
        String sql = """
                SELECT
                    ft.currency_code,
                    ft.transaction_type,
                    COALESCE(
                        SUM(ft.amount),
                        0.00
                    ) AS total_amount,
                    COUNT(ft.id) AS transaction_count

                FROM financial_transactions ft

                WHERE ft.user_id = :userId
                  AND ft.transaction_status = 'POSTED'
                  AND ft.transaction_date
                      BETWEEN :fromDate AND :toDate

                GROUP BY
                    ft.currency_code,
                    ft.transaction_type

                ORDER BY
                    ft.currency_code ASC,
                    ft.transaction_type ASC
                """;

        return jdbcTemplate.query(
                sql,
                createDateParameters(
                        userId,
                        fromDate,
                        toDate
                ),
                (
                        resultSet,
                        rowNumber
                ) -> new PeriodTotalRecord(
                        resultSet.getString(
                                "currency_code"
                        ),
                        TransactionType.valueOf(
                                resultSet.getString(
                                        "transaction_type"
                                )
                        ),
                        resultSet.getBigDecimal(
                                "total_amount"
                        ),
                        resultSet.getLong(
                                "transaction_count"
                        )
                )
        );
    }

    public List<MonthlyTrendRecord> findMonthlyTrend(
        long userId,
        LocalDate fromDate,
        LocalDate toDate
) {
    String sql = """
            SELECT
                ft.currency_code,

                DATE_FORMAT(
                    ft.transaction_date,
                    '%Y-%m'
                ) AS month_key,

                ft.transaction_type,

                COALESCE(
                    SUM(ft.amount),
                    0.00
                ) AS total_amount,

                COUNT(ft.id) AS transaction_count

            FROM financial_transactions ft

            WHERE ft.user_id = :userId
              AND ft.transaction_status = 'POSTED'
              AND ft.transaction_date
                  BETWEEN :fromDate AND :toDate

            GROUP BY
                ft.currency_code,
                DATE_FORMAT(
                    ft.transaction_date,
                    '%Y-%m'
                ),
                ft.transaction_type

            ORDER BY
                ft.currency_code ASC,
                month_key ASC,
                ft.transaction_type ASC
            """;

    return jdbcTemplate.query(
            sql,
            createDateParameters(
                    userId,
                    fromDate,
                    toDate
            ),
            (
                    resultSet,
                    rowNumber
            ) -> new MonthlyTrendRecord(
                    resultSet.getString(
                            "currency_code"
                    ),
                    resultSet.getString(
                            "month_key"
                    ),
                    TransactionType.valueOf(
                            resultSet.getString(
                                    "transaction_type"
                            )
                    ),
                    resultSet.getBigDecimal(
                            "total_amount"
                    ),
                    resultSet.getLong(
                            "transaction_count"
                    )
            )
    );
}

    public List<CategoryBreakdownRecord>
    findExpenseByCategory(
            long userId,
            LocalDate fromDate,
            LocalDate toDate
    ) {
        String sql = """
                SELECT
                    ft.currency_code,

                    tc.public_id AS category_public_id,

                    COALESCE(
                        tc.name,
                        'Uncategorized'
                    ) AS category_name,

                    COALESCE(
                        tc.icon_key,
                        'ELLIPSIS'
                    ) AS icon_key,

                    COALESCE(
                        tc.color_key,
                        'SLATE'
                    ) AS color_key,

                    COALESCE(
                        SUM(ft.amount),
                        0.00
                    ) AS total_amount,

                    COUNT(ft.id) AS transaction_count

                FROM financial_transactions ft

                LEFT JOIN transaction_categories tc
                    ON tc.id = ft.category_id

                WHERE ft.user_id = :userId
                  AND ft.transaction_status = 'POSTED'
                  AND ft.transaction_type = 'EXPENSE'
                  AND ft.transaction_date
                      BETWEEN :fromDate AND :toDate

                GROUP BY
                    ft.currency_code,
                    tc.id,
                    tc.public_id,
                    tc.name,
                    tc.icon_key,
                    tc.color_key

                ORDER BY
                    ft.currency_code ASC,
                    total_amount DESC,
                    category_name ASC
                """;

        return jdbcTemplate.query(
                sql,
                createDateParameters(
                        userId,
                        fromDate,
                        toDate
                ),
                (
                        resultSet,
                        rowNumber
                ) -> new CategoryBreakdownRecord(
                        resultSet.getString(
                                "currency_code"
                        ),
                        resultSet.getString(
                                "category_public_id"
                        ),
                        resultSet.getString(
                                "category_name"
                        ),
                        resultSet.getString(
                                "icon_key"
                        ),
                        resultSet.getString(
                                "color_key"
                        ),
                        resultSet.getBigDecimal(
                                "total_amount"
                        ),
                        resultSet.getLong(
                                "transaction_count"
                        )
                )
        );
    }

    public List<AccountBreakdownRecord>
    findExpenseByAccount(
            long userId,
            LocalDate fromDate,
            LocalDate toDate
    ) {
        String sql = """
                SELECT
                    ft.currency_code,

                    fa.public_id AS account_public_id,

                    fa.name AS account_name,

                    fa.account_type,

                    COALESCE(
                        SUM(ft.amount),
                        0.00
                    ) AS total_amount,

                    COUNT(ft.id) AS transaction_count

                FROM financial_transactions ft

                INNER JOIN financial_accounts fa
                    ON fa.id = ft.account_id

                WHERE ft.user_id = :userId
                  AND ft.transaction_status = 'POSTED'
                  AND ft.transaction_type = 'EXPENSE'
                  AND ft.transaction_date
                      BETWEEN :fromDate AND :toDate

                GROUP BY
                    ft.currency_code,
                    fa.id,
                    fa.public_id,
                    fa.name,
                    fa.account_type

                ORDER BY
                    ft.currency_code ASC,
                    total_amount DESC,
                    fa.name ASC
                """;

        return jdbcTemplate.query(
                sql,
                createDateParameters(
                        userId,
                        fromDate,
                        toDate
                ),
                (
                        resultSet,
                        rowNumber
                ) -> new AccountBreakdownRecord(
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
                                "account_type"
                        ),
                        resultSet.getBigDecimal(
                                "total_amount"
                        ),
                        resultSet.getLong(
                                "transaction_count"
                        )
                )
        );
    }

    public List<WeekdayBreakdownRecord>
    findExpenseByWeekday(
            long userId,
            LocalDate fromDate,
            LocalDate toDate
    ) {
        String sql = """
                SELECT
                    ft.currency_code,

                    WEEKDAY(
                        ft.transaction_date
                    ) AS weekday_index,

                    COALESCE(
                        SUM(ft.amount),
                        0.00
                    ) AS total_amount,

                    COUNT(ft.id) AS transaction_count

                FROM financial_transactions ft

                WHERE ft.user_id = :userId
                  AND ft.transaction_status = 'POSTED'
                  AND ft.transaction_type = 'EXPENSE'
                  AND ft.transaction_date
                      BETWEEN :fromDate AND :toDate

                GROUP BY
                    ft.currency_code,
                    WEEKDAY(
                        ft.transaction_date
                    )

                ORDER BY
                    ft.currency_code ASC,
                    weekday_index ASC
                """;

        return jdbcTemplate.query(
                sql,
                createDateParameters(
                        userId,
                        fromDate,
                        toDate
                ),
                (
                        resultSet,
                        rowNumber
                ) -> new WeekdayBreakdownRecord(
                        resultSet.getString(
                                "currency_code"
                        ),
                        resultSet.getInt(
                                "weekday_index"
                        ),
                        resultSet.getBigDecimal(
                                "total_amount"
                        ),
                        resultSet.getLong(
                                "transaction_count"
                        )
                )
        );
    }

    private MapSqlParameterSource createDateParameters(
            long userId,
            LocalDate fromDate,
            LocalDate toDate
    ) {
        return new MapSqlParameterSource()
                .addValue(
                        "userId",
                        userId
                )
                .addValue(
                        "fromDate",
                        fromDate
                )
                .addValue(
                        "toDate",
                        toDate
                );
    }

    public record PeriodTotalRecord(

            String currencyCode,

            TransactionType transactionType,

            BigDecimal totalAmount,

            long transactionCount
    ) {
    }

    public record MonthlyTrendRecord(

            String currencyCode,

            String yearMonth,

            TransactionType transactionType,

            BigDecimal totalAmount,

            long transactionCount
    ) {
    }

    public record CategoryBreakdownRecord(

            String currencyCode,

            String categoryPublicId,

            String categoryName,

            String iconKey,

            String colorKey,

            BigDecimal totalAmount,

            long transactionCount
    ) {
    }

    public record AccountBreakdownRecord(

            String currencyCode,

            String accountPublicId,

            String accountName,

            String accountType,

            BigDecimal totalAmount,

            long transactionCount
    ) {
    }

    public record WeekdayBreakdownRecord(

            String currencyCode,

            int weekdayIndex,

            BigDecimal totalAmount,

            long transactionCount
    ) {
    }
}