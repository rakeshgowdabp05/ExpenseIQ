package com.expensetracker.service.impl;

import com.expensetracker.common.ApplicationMessages;
import com.expensetracker.common.ReportMessages;
import com.expensetracker.dto.FinancialReportResponse;
import com.expensetracker.dto.ReportExportFile;
import com.expensetracker.entity.ReportExportSettingKey;
import com.expensetracker.entity.User;
import com.expensetracker.exception.BadRequestException;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.repository.ReportExportSettingRepository;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.service.FinancialReportService;
import com.expensetracker.service.UserTimezoneResolver;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class FinancialReportServiceImpl
        implements FinancialReportService {

    private static final BigDecimal ZERO =
            BigDecimal.ZERO.setScale(2);

    private static final BigDecimal ONE_HUNDRED =
            BigDecimal.valueOf(100);

    private static final int MONEY_SCALE = 2;

    private static final int PERCENTAGE_SCALE = 2;

    private final NamedParameterJdbcTemplate jdbcTemplate;

    private final UserRepository userRepository;

    private final UserTimezoneResolver userTimezoneResolver;

    private final ReportExportSettingRepository exportSettingRepository;

    private final Clock clock;

    public FinancialReportServiceImpl(
            NamedParameterJdbcTemplate jdbcTemplate,
            UserRepository userRepository,
            UserTimezoneResolver userTimezoneResolver,
            ReportExportSettingRepository exportSettingRepository,
            Clock clock
    ) {
        this.jdbcTemplate =
                jdbcTemplate;

        this.userRepository =
                userRepository;

        this.userTimezoneResolver =
                userTimezoneResolver;

        this.exportSettingRepository =
                exportSettingRepository;

        this.clock =
                clock;
    }

    @Override
    @Transactional(readOnly = true)
    public FinancialReportResponse getReport(
            String authenticatedEmail,
            LocalDate fromDate,
            LocalDate toDate
    ) {
        User user =
                getUser(authenticatedEmail);

        ZoneId userZone =
                userTimezoneResolver.resolve(user);

        DateRange dateRange =
                resolveDateRange(
                        fromDate,
                        toDate,
                        LocalDate.now(clock.withZone(userZone))
                );

        List<String> currencies =
                findCurrencies(
                        user.getId(),
                        dateRange
                );

        List<FinancialReportResponse.CurrencyReport>
                currencyReports =
                currencies.stream()
                        .map(
                                currencyCode ->
                                        buildCurrencyReport(
                                                user.getId(),
                                                currencyCode,
                                                dateRange
                                        )
                        )
                        .toList();

        return new FinancialReportResponse(
                clock.instant(),
                userZone.getId(),
                dateRange.fromDate(),
                dateRange.toDate(),
                currencyReports
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ReportExportFile exportCsv(
            String authenticatedEmail,
            LocalDate fromDate,
            LocalDate toDate
    ) {
        FinancialReportResponse report =
                getReport(
                        authenticatedEmail,
                        fromDate,
                        toDate
                );

        String brandName =
                exportSettingRepository.getRequiredString(
                        ReportExportSettingKey.BRAND_NAME
                );

        String fileBaseName =
                exportSettingRepository.getRequiredString(
                        ReportExportSettingKey.FILE_BASENAME
                );

        String csv =
                buildCsv(
                        report,
                        brandName
                );

        byte[] csvContent =
                ("\uFEFF" + csv).getBytes(
                        StandardCharsets.UTF_8
                );

        return new ReportExportFile(
                buildFileName(
                        fileBaseName,
                        report.fromDate(),
                        report.toDate(),
                        "csv"
                ),
                "text/csv; charset=UTF-8",
                csvContent
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ReportExportFile exportPdf(
            String authenticatedEmail,
            LocalDate fromDate,
            LocalDate toDate
    ) {
        FinancialReportResponse report =
                getReport(
                        authenticatedEmail,
                        fromDate,
                        toDate
                );

        String brandName =
                exportSettingRepository.getRequiredString(
                        ReportExportSettingKey.BRAND_NAME
                );

        String watermarkText =
                exportSettingRepository.getRequiredString(
                        ReportExportSettingKey.WATERMARK_TEXT
                );

        String fileBaseName =
                exportSettingRepository.getRequiredString(
                        ReportExportSettingKey.FILE_BASENAME
                );

        int lineLimit =
                exportSettingRepository.getRequiredPositiveInteger(
                        ReportExportSettingKey.PDF_LINE_LIMIT
                );

        byte[] pdf =
                ReportPdfWriter.write(
                        report,
                        brandName,
                        watermarkText,
                        lineLimit
                );

        return new ReportExportFile(
                buildFileName(
                        fileBaseName,
                        report.fromDate(),
                        report.toDate(),
                        "pdf"
                ),
                "application/pdf",
                pdf
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ReportExportFile exportXlsx(
            String authenticatedEmail,
            LocalDate fromDate,
            LocalDate toDate
    ) {
        FinancialReportResponse report =
                getReport(
                        authenticatedEmail,
                        fromDate,
                        toDate
                );

        String brandName =
                exportSettingRepository.getRequiredString(
                        ReportExportSettingKey.BRAND_NAME
                );

        String fileBaseName =
                exportSettingRepository.getRequiredString(
                        ReportExportSettingKey.FILE_BASENAME
                );

        byte[] workbook =
                ReportXlsxWriter.write(
                        report,
                        brandName
                );

        return new ReportExportFile(
                buildFileName(
                        fileBaseName,
                        report.fromDate(),
                        report.toDate(),
                        "xlsx"
                ),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                workbook
        );
    }

    private FinancialReportResponse.CurrencyReport buildCurrencyReport(
            Long userId,
            String currencyCode,
            DateRange dateRange
    ) {
        return new FinancialReportResponse.CurrencyReport(
                currencyCode,
                findTotals(
                        userId,
                        currencyCode,
                        dateRange
                ),
                findCategoryExpenses(
                        userId,
                        currencyCode,
                        dateRange
                ),
                findBudgets(
                        userId,
                        currencyCode,
                        dateRange
                ),
                findGoals(
                        userId,
                        currencyCode
                ),
                findRecentTransactions(
                        userId,
                        currencyCode,
                        dateRange,
                        exportSettingRepository.getRequiredPositiveInteger(
                                ReportExportSettingKey.RECENT_TRANSACTION_LIMIT
                        )
                )
        );
    }

    private List<String> findCurrencies(
            Long userId,
            DateRange dateRange
    ) {
        String sql = """
                SELECT DISTINCT currency_code
                FROM financial_transactions
                WHERE user_id = :userId
                  AND transaction_status = 'POSTED'
                  AND transaction_date BETWEEN :fromDate AND :toDate

                UNION

                SELECT DISTINCT currency_code
                FROM budgets
                WHERE user_id = :userId
                  AND archived = FALSE
                  AND end_date >= :fromDate
                  AND start_date <= :toDate

                UNION

                SELECT DISTINCT currency_code
                FROM savings_goals
                WHERE user_id = :userId
                  AND status <> 'ARCHIVED'

                ORDER BY currency_code
                """;

        return jdbcTemplate.query(
                sql,
                baseParams(userId, dateRange),
                (resultSet, rowNumber) ->
                        resultSet.getString("currency_code")
        );
    }

    private FinancialReportResponse.ReportTotals findTotals(
            Long userId,
            String currencyCode,
            DateRange dateRange
    ) {
        String sql = """
                SELECT
                    transaction_type,
                    COALESCE(SUM(amount), 0.00) AS total_amount,
                    COUNT(id) AS transaction_count
                FROM financial_transactions
                WHERE user_id = :userId
                  AND currency_code = :currencyCode
                  AND transaction_status = 'POSTED'
                  AND transaction_date BETWEEN :fromDate AND :toDate
                GROUP BY transaction_type
                """;

        Map<String, TotalRow> rows =
                new LinkedHashMap<>();

        jdbcTemplate.query(
                sql,
                baseParams(userId, dateRange)
                        .addValue("currencyCode", currencyCode),
                resultSet -> {
                    rows.put(
                            resultSet.getString("transaction_type"),
                            new TotalRow(
                                    money(
                                            resultSet.getBigDecimal(
                                                    "total_amount"
                                            )
                                    ),
                                    resultSet.getLong(
                                            "transaction_count"
                                    )
                            )
                    );
                }
        );

        TotalRow income =
                rows.getOrDefault(
                        "INCOME",
                        new TotalRow(ZERO, 0L)
                );

        TotalRow expense =
                rows.getOrDefault(
                        "EXPENSE",
                        new TotalRow(ZERO, 0L)
                );

        TotalRow transfer =
                rows.getOrDefault(
                        "TRANSFER",
                        new TotalRow(ZERO, 0L)
                );

        return new FinancialReportResponse.ReportTotals(
                income.amount(),
                expense.amount(),
                money(
                        income.amount()
                                .subtract(
                                        expense.amount()
                                )
                ),
                transfer.amount(),
                income.count()
                        + expense.count()
                        + transfer.count(),
                income.count(),
                expense.count(),
                transfer.count()
        );
    }

    private List<FinancialReportResponse.CategoryReportRow>
    findCategoryExpenses(
            Long userId,
            String currencyCode,
            DateRange dateRange
    ) {
        String sql = """
                SELECT
                    tc.public_id AS category_public_id,
                    tc.name AS category_name,
                    COALESCE(SUM(ft.amount), 0.00) AS total_amount,
                    COUNT(ft.id) AS transaction_count
                FROM financial_transactions ft
                JOIN transaction_categories tc
                  ON tc.id = ft.category_id
                WHERE ft.user_id = :userId
                  AND ft.currency_code = :currencyCode
                  AND ft.transaction_type = 'EXPENSE'
                  AND ft.transaction_status = 'POSTED'
                  AND ft.transaction_date BETWEEN :fromDate AND :toDate
                GROUP BY
                    tc.public_id,
                    tc.name
                ORDER BY total_amount DESC
                """;

        List<CategoryAmountRow> rows =
                jdbcTemplate.query(
                        sql,
                        baseParams(userId, dateRange)
                                .addValue(
                                        "currencyCode",
                                        currencyCode
                                ),
                        (resultSet, rowNumber) ->
                                new CategoryAmountRow(
                                        resultSet.getString(
                                                "category_public_id"
                                        ),
                                        resultSet.getString(
                                                "category_name"
                                        ),
                                        money(
                                                resultSet.getBigDecimal(
                                                        "total_amount"
                                                )
                                        ),
                                        resultSet.getLong(
                                                "transaction_count"
                                        )
                                )
                );

        BigDecimal totalExpense =
                rows.stream()
                        .map(CategoryAmountRow::amount)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        return rows.stream()
                .map(
                        row ->
                                new FinancialReportResponse
                                        .CategoryReportRow(
                                        row.publicId(),
                                        row.name(),
                                        row.amount(),
                                        row.count(),
                                        percentage(
                                                row.amount(),
                                                totalExpense
                                        )
                                )
                )
                .toList();
    }

    private List<FinancialReportResponse.BudgetReportRow> findBudgets(
            Long userId,
            String currencyCode,
            DateRange dateRange
    ) {
        String sql = """
                SELECT
                    b.public_id,
                    b.name,
                    b.limit_amount,
                    COALESCE(
                        (
                            SELECT SUM(ft.amount)
                            FROM financial_transactions ft
                            WHERE ft.user_id = b.user_id
                              AND ft.transaction_type = 'EXPENSE'
                              AND ft.transaction_status = 'POSTED'
                              AND ft.currency_code = b.currency_code
                              AND ft.transaction_date BETWEEN b.start_date AND b.end_date
                              AND (
                                  b.category_id IS NULL
                                  OR ft.category_id = b.category_id
                              )
                        ),
                        0.00
                    ) AS spent_amount,
                    b.active,
                    b.archived
                FROM budgets b
                WHERE b.user_id = :userId
                  AND b.currency_code = :currencyCode
                  AND b.archived = FALSE
                  AND b.end_date >= :fromDate
                  AND b.start_date <= :toDate
                ORDER BY b.end_date DESC, b.name ASC
                """;

        return jdbcTemplate.query(
                sql,
                baseParams(userId, dateRange)
                        .addValue("currencyCode", currencyCode),
                (resultSet, rowNumber) -> {
                    BigDecimal limitAmount =
                            money(
                                    resultSet.getBigDecimal(
                                            "limit_amount"
                                    )
                            );

                    BigDecimal spentAmount =
                            money(
                                    resultSet.getBigDecimal(
                                            "spent_amount"
                                    )
                            );

                    BigDecimal remainingAmount =
                            money(
                                    limitAmount
                                            .subtract(spentAmount)
                                            .max(BigDecimal.ZERO)
                            );

                    String status =
                            resultSet.getBoolean("active")
                                    ? "ACTIVE"
                                    : "INACTIVE";

                    if (spentAmount.compareTo(limitAmount) >= 0) {
                        status =
                                "EXCEEDED";
                    }

                    return new FinancialReportResponse.BudgetReportRow(
                            resultSet.getString("public_id"),
                            resultSet.getString("name"),
                            limitAmount,
                            spentAmount,
                            remainingAmount,
                            percentage(
                                    spentAmount,
                                    limitAmount
                            ),
                            status
                    );
                }
        );
    }

    private List<FinancialReportResponse.GoalReportRow> findGoals(
            Long userId,
            String currencyCode
    ) {
        String sql = """
                SELECT
                    public_id,
                    name,
                    target_amount,
                    current_amount,
                    status,
                    target_date
                FROM savings_goals
                WHERE user_id = :userId
                  AND currency_code = :currencyCode
                  AND status <> 'ARCHIVED'
                ORDER BY target_date ASC, name ASC
                """;

        return jdbcTemplate.query(
                sql,
                new MapSqlParameterSource()
                        .addValue("userId", userId)
                        .addValue("currencyCode", currencyCode),
                (resultSet, rowNumber) -> {
                    BigDecimal targetAmount =
                            money(
                                    resultSet.getBigDecimal(
                                            "target_amount"
                                    )
                            );

                    BigDecimal currentAmount =
                            money(
                                    resultSet.getBigDecimal(
                                            "current_amount"
                                    )
                            );

                    return new FinancialReportResponse.GoalReportRow(
                            resultSet.getString("public_id"),
                            resultSet.getString("name"),
                            targetAmount,
                            currentAmount,
                            money(
                                    targetAmount
                                            .subtract(currentAmount)
                                            .max(BigDecimal.ZERO)
                            ),
                            percentage(
                                    currentAmount,
                                    targetAmount
                            ),
                            resultSet.getString("status"),
                            resultSet.getDate("target_date")
                                    .toLocalDate()
                    );
                }
        );
    }

    private List<FinancialReportResponse.TransactionReportRow>
    findRecentTransactions(
            Long userId,
            String currencyCode,
            DateRange dateRange,
            int recentTransactionLimit
    ) {
        String sql = """
                SELECT
                    ft.public_id,
                    ft.transaction_type,
                    ft.transaction_date,
                    fa.name AS account_name,
                    tc.name AS category_name,
                    ft.amount,
                    ft.merchant_name,
                    ft.description
                FROM financial_transactions ft
                JOIN financial_accounts fa
                  ON fa.id = ft.account_id
                LEFT JOIN transaction_categories tc
                  ON tc.id = ft.category_id
                WHERE ft.user_id = :userId
                  AND ft.currency_code = :currencyCode
                  AND ft.transaction_status = 'POSTED'
                  AND ft.transaction_date BETWEEN :fromDate AND :toDate
                ORDER BY ft.transaction_date DESC, ft.id DESC
                LIMIT :limit
                """;

        return jdbcTemplate.query(
                sql,
                baseParams(userId, dateRange)
                        .addValue("currencyCode", currencyCode)
                        .addValue("limit", recentTransactionLimit),
                (resultSet, rowNumber) ->
                        new FinancialReportResponse
                                .TransactionReportRow(
                                resultSet.getString("public_id"),
                                resultSet.getString("transaction_type"),
                                resultSet.getDate("transaction_date")
                                        .toLocalDate(),
                                resultSet.getString("account_name"),
                                resultSet.getString("category_name"),
                                money(
                                        resultSet.getBigDecimal(
                                                "amount"
                                        )
                                ),
                                resultSet.getString("merchant_name"),
                                resultSet.getString("description")
                        )
        );
    }

    private String buildCsv(
            FinancialReportResponse report,
            String brandName
    ) {
        StringBuilder csv =
                new StringBuilder();

        appendCsvRow(
                csv,
                "sep=,"
        );

        appendCsvRow(csv);

        appendCsvRow(
                csv,
                brandName + " Financial Report"
        );

        appendCsvRow(
                csv,
                "Report Period",
                report.fromDate(),
                report.toDate()
        );

        appendCsvRow(
                csv,
                "Generated At",
                report.generatedAt()
        );

        appendCsvRow(csv);

        for (FinancialReportResponse.CurrencyReport currency
                : report.currencies()) {
            appendCsvRow(
                    csv,
                    "=============================="
            );

            appendCsvRow(
                    csv,
                    "Currency",
                    currency.currencyCode()
            );

            appendCsvRow(
                    csv,
                    "=============================="
            );

            appendCsvRow(csv);

            appendCsvRow(
                    csv,
                    "SUMMARY"
            );

            appendCsvRow(
                    csv,
                    "Metric",
                    "Amount",
                    "Transaction Count"
            );

            appendCsvRow(
                    csv,
                    "Income",
                    currency.totals().income(),
                    currency.totals().incomeTransactionCount()
            );

            appendCsvRow(
                    csv,
                    "Expenses",
                    currency.totals().expense(),
                    currency.totals().expenseTransactionCount()
            );

            appendCsvRow(
                    csv,
                    "Net Cash Flow",
                    currency.totals().netCashFlow(),
                    currency.totals().transactionCount()
            );

            appendCsvRow(
                    csv,
                    "Transfer Volume",
                    currency.totals().transferVolume(),
                    currency.totals().transferTransactionCount()
            );

            appendCsvRow(csv);

            appendCsvRow(
                    csv,
                    "CATEGORY EXPENSE REPORT"
            );

            appendCsvRow(
                    csv,
                    "Category",
                    "Amount",
                    "Transactions",
                    "Share Percent"
            );

            for (FinancialReportResponse.CategoryReportRow row
                    : currency.categoryExpenses()) {
                appendCsvRow(
                        csv,
                        row.categoryName(),
                        row.amount(),
                        row.transactionCount(),
                        row.percentageOfExpense()
                );
            }

            appendCsvRow(csv);

            appendCsvRow(
                    csv,
                    "BUDGET PERFORMANCE"
            );

            appendCsvRow(
                    csv,
                    "Budget",
                    "Limit",
                    "Spent",
                    "Remaining",
                    "Usage Percent",
                    "Status"
            );

            for (FinancialReportResponse.BudgetReportRow row
                    : currency.budgets()) {
                appendCsvRow(
                        csv,
                        row.budgetName(),
                        row.limitAmount(),
                        row.spentAmount(),
                        row.remainingAmount(),
                        row.usagePercentage(),
                        row.status()
                );
            }

            appendCsvRow(csv);

            appendCsvRow(
                    csv,
                    "SAVINGS GOAL PROGRESS"
            );

            appendCsvRow(
                    csv,
                    "Goal",
                    "Current",
                    "Target",
                    "Remaining",
                    "Progress Percent",
                    "Status",
                    "Target Date"
            );

            for (FinancialReportResponse.GoalReportRow row
                    : currency.goals()) {
                appendCsvRow(
                        csv,
                        row.goalName(),
                        row.currentAmount(),
                        row.targetAmount(),
                        row.remainingAmount(),
                        row.progressPercentage(),
                        row.status(),
                        row.targetDate()
                );
            }

            appendCsvRow(csv);

            appendCsvRow(
                    csv,
                    "RECENT TRANSACTIONS"
            );

            appendCsvRow(
                    csv,
                    "Date",
                    "Type",
                    "Account",
                    "Category",
                    "Amount",
                    "Merchant",
                    "Description"
            );

            for (FinancialReportResponse.TransactionReportRow row
                    : currency.recentTransactions()) {
                appendCsvRow(
                        csv,
                        row.transactionDate(),
                        row.transactionType(),
                        row.accountName(),
                        row.categoryName(),
                        row.amount(),
                        row.merchantName(),
                        row.description()
                );
            }

            appendCsvRow(csv);
        }

        return csv.toString();
    }

    private List<String> buildPdfLines(
            FinancialReportResponse report,
            String brandName,
            int lineLimit
    ) {
        List<String> lines =
                new ArrayList<>();

        lines.add(brandName + " Financial Report");
        lines.add(
                "Period: "
                        + report.fromDate()
                        + " to "
                        + report.toDate()
        );
        lines.add("Generated: " + report.generatedAt());
        lines.add("");

        for (FinancialReportResponse.CurrencyReport currency
                : report.currencies()) {
            lines.add("Currency: " + currency.currencyCode());
            lines.add("----------------------------------------");
            lines.add(
                    "Income: "
                            + currency.totals().income()
                            + " | Expense: "
                            + currency.totals().expense()
                            + " | Net cash flow: "
                            + currency.totals().netCashFlow()
            );
            lines.add(
                    "Transfer volume: "
                            + currency.totals().transferVolume()
                            + " | Transactions: "
                            + currency.totals().transactionCount()
            );

            if (!currency.categoryExpenses().isEmpty()) {
                lines.add("");
                lines.add("Category expense summary:");
                currency.categoryExpenses()
                        .stream()
                        .limit(8)
                        .forEach(
                                row ->
                                        lines.add(
                                                "- "
                                                        + row.categoryName()
                                                        + ": "
                                                        + row.amount()
                                                        + " | "
                                                        + row.transactionCount()
                                                        + " transactions | "
                                                        + row.percentageOfExpense()
                                                        + "%"
                                        )
                        );
            }

            if (!currency.budgets().isEmpty()) {
                lines.add("");
                lines.add("Budget performance:");
                currency.budgets()
                        .stream()
                        .limit(8)
                        .forEach(
                                row ->
                                        lines.add(
                                                "- "
                                                        + row.budgetName()
                                                        + ": spent "
                                                        + row.spentAmount()
                                                        + " of "
                                                        + row.limitAmount()
                                                        + " | remaining "
                                                        + row.remainingAmount()
                                                        + " | "
                                                        + row.status()
                                        )
                        );
            }

            if (!currency.goals().isEmpty()) {
                lines.add("");
                lines.add("Savings goal progress:");
                currency.goals()
                        .stream()
                        .limit(8)
                        .forEach(
                                row ->
                                        lines.add(
                                                "- "
                                                        + row.goalName()
                                                        + ": "
                                                        + row.currentAmount()
                                                        + " of "
                                                        + row.targetAmount()
                                                        + " | "
                                                        + row.progressPercentage()
                                                        + "% | "
                                                        + row.status()
                                        )
                        );
            }

            lines.add("");
        }

        if (lines.size() > lineLimit) {
            List<String> limitedLines =
                    new ArrayList<>(
                            lines.subList(
                                    0,
                                    lineLimit
                            )
                    );

            limitedLines.add("");
            limitedLines.add(
                    "More rows are available in the CSV export."
            );

            return limitedLines;
        }

        return lines;
    }

    private void appendCsvRow(
            StringBuilder csv,
            Object... columns
    ) {
        for (int index = 0; index < columns.length; index++) {
            if (index > 0) {
                csv.append(',');
            }

            csv.append(
                    escapeCsv(
                            columns[index]
                    )
            );
        }

        csv.append("\r\n");
    }

    private String escapeCsv(
            Object value
    ) {
        String text =
                value == null
                        ? ""
                        : String.valueOf(value);

        boolean requiresEscaping =
                text.contains(",")
                        || text.contains("\"")
                        || text.contains("\n")
                        || text.contains("\r");

        String escaped =
                text.replace(
                        "\"",
                        "\"\""
                );

        return requiresEscaping
                ? "\"" + escaped + "\""
                : escaped;
    }

    private DateRange resolveDateRange(
            LocalDate requestedFromDate,
            LocalDate requestedToDate,
            LocalDate currentDate
    ) {
        boolean fromProvided =
                requestedFromDate != null;

        boolean toProvided =
                requestedToDate != null;

        if (fromProvided != toProvided) {
            throw new BadRequestException(
                    ReportMessages.DATE_RANGE_PAIR_REQUIRED
            );
        }

        if (!fromProvided) {
            LocalDate firstDayOfMonth =
                    currentDate.withDayOfMonth(1);

            return new DateRange(
                    firstDayOfMonth,
                    currentDate
            );
        }

        if (requestedFromDate.isAfter(requestedToDate)) {
            throw new BadRequestException(
                    ReportMessages.DATE_RANGE_INVALID
            );
        }

        if (requestedToDate.isAfter(currentDate)) {
            throw new BadRequestException(
                    ReportMessages.FUTURE_DATE_NOT_ALLOWED
            );
        }

        return new DateRange(
                requestedFromDate,
                requestedToDate
        );
    }

    private MapSqlParameterSource baseParams(
            Long userId,
            DateRange dateRange
    ) {
        return new MapSqlParameterSource()
                .addValue("userId", userId)
                .addValue("fromDate", dateRange.fromDate())
                .addValue("toDate", dateRange.toDate());
    }

    private User getUser(
            String authenticatedEmail
    ) {
        return userRepository
                .findByEmailIgnoreCase(
                        authenticatedEmail
                )
                .orElseThrow(
                        () ->
                                new ResourceNotFoundException(
                                        ApplicationMessages
                                                .USER_ACCOUNT_NOT_FOUND
                                )
                );
    }

    private BigDecimal money(
            BigDecimal value
    ) {
        return (
                value == null
                        ? BigDecimal.ZERO
                        : value
        ).setScale(
                MONEY_SCALE,
                RoundingMode.HALF_EVEN
        );
    }

    private BigDecimal percentage(
            BigDecimal part,
            BigDecimal total
    ) {
        if (
                total == null
                        || total.compareTo(BigDecimal.ZERO) <= 0
        ) {
            return BigDecimal.ZERO.setScale(
                    PERCENTAGE_SCALE
            );
        }

        return part
                .divide(
                        total,
                        8,
                        RoundingMode.HALF_UP
                )
                .multiply(ONE_HUNDRED)
                .setScale(
                        PERCENTAGE_SCALE,
                        RoundingMode.HALF_UP
                );
    }

    private String buildFileName(
            String baseName,
            LocalDate fromDate,
            LocalDate toDate,
            String extension
    ) {
        return baseName
                + "-"
                + fromDate
                + "-to-"
                + toDate
                + "."
                + extension;
    }

    private record DateRange(
            LocalDate fromDate,
            LocalDate toDate
    ) {
    }

    private record TotalRow(
            BigDecimal amount,
            long count
    ) {
    }

    private record CategoryAmountRow(
            String publicId,
            String name,
            BigDecimal amount,
            long count
    ) {
    }

    private static final class SimplePdfWriter {

        private SimplePdfWriter() {
        }

        private static byte[] write(
                List<String> lines,
                String watermarkText
        ) {
            StringBuilder textCommands =
                    new StringBuilder();

            if (
                    watermarkText != null
                            && !watermarkText.isBlank()
            ) {
                textCommands
                        .append("q\n")
                        .append("0.90 0.90 0.90 rg\n")
                        .append("BT\n")
                        .append("/F1 48 Tf\n")
                        .append("0.707 0.707 -0.707 0.707 130 360 Tm\n")
                        .append('(')
                        .append(
                                escapePdf(
                                        watermarkText
                                )
                        )
                        .append(") Tj\n")
                        .append("ET\n")
                        .append("Q\n");
            }

            textCommands.append(
                    "0 0 0 rg\nBT\n/F1 11 Tf\n50 790 Td\n"
            );

            for (String line : lines) {
                for (String chunk : wrap(line, 92)) {
                    textCommands
                            .append('(')
                            .append(escapePdf(chunk))
                            .append(") Tj\n0 -15 Td\n");
                }
            }

            textCommands.append("ET\n");

            byte[] streamBytes =
                    textCommands
                            .toString()
                            .getBytes(
                                    StandardCharsets.US_ASCII
                            );

            List<byte[]> objects =
                    List.of(
                            ascii(
                                    "<< /Type /Catalog /Pages 2 0 R >>"
                            ),
                            ascii(
                                    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>"
                            ),
                            ascii(
                                    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>"
                            ),
                            ascii(
                                    "<< /Length "
                                            + streamBytes.length
                                            + " >>\nstream\n"
                                            + textCommands
                                            + "endstream"
                            ),
                            ascii(
                                    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
                            )
                    );

            ByteArrayOutputStream output =
                    new ByteArrayOutputStream();

            writeAscii(
                    output,
                    "%PDF-1.4\n"
            );

            List<Integer> offsets =
                    new ArrayList<>();

            for (int index = 0; index < objects.size(); index++) {
                offsets.add(output.size());

                writeAscii(
                        output,
                        (index + 1)
                                + " 0 obj\n"
                );

                writeBytes(
                        output,
                        objects.get(index)
                );

                writeAscii(
                        output,
                        "\nendobj\n"
                );
            }

            int xrefOffset =
                    output.size();

            writeAscii(
                    output,
                    "xref\n0 "
                            + (objects.size() + 1)
                            + "\n"
            );

            writeAscii(
                    output,
                    "0000000000 65535 f \n"
            );

            for (Integer offset : offsets) {
                writeAscii(
                        output,
                        String.format(
                                "%010d 00000 n \n",
                                offset
                        )
                );
            }

            writeAscii(
                    output,
                    "trailer\n<< /Size "
                            + (objects.size() + 1)
                            + " /Root 1 0 R >>\nstartxref\n"
                            + xrefOffset
                            + "\n%%EOF"
            );

            return output.toByteArray();
        }

        private static List<String> wrap(
                String value,
                int maxLength
        ) {
            String cleanValue =
                    value == null
                            ? ""
                            : value;

            List<String> result =
                    new ArrayList<>();

            String remaining =
                    cleanValue;

            while (remaining.length() > maxLength) {
                int breakIndex =
                        remaining.lastIndexOf(
                                ' ',
                                maxLength
                        );

                if (breakIndex <= 0) {
                    breakIndex =
                            maxLength;
                }

                result.add(
                        remaining.substring(
                                0,
                                breakIndex
                        )
                );

                remaining =
                        remaining.substring(
                                breakIndex
                        ).trim();
            }

            result.add(remaining);

            return result;
        }

        private static String escapePdf(
                String value
        ) {
            return value.replaceAll(
                            "[^\\x20-\\x7E]",
                            " "
                    )
                    .replace("\\", "\\\\")
                    .replace("(", "\\(")
                    .replace(")", "\\)");
        }

        private static byte[] ascii(
                String value
        ) {
            return value.getBytes(
                    StandardCharsets.US_ASCII
            );
        }

        private static void writeAscii(
                ByteArrayOutputStream output,
                String value
        ) {
            writeBytes(
                    output,
                    ascii(value)
            );
        }

        private static void writeBytes(
                ByteArrayOutputStream output,
                byte[] bytes
        ) {
            output.write(
                    bytes,
                    0,
                    bytes.length
            );
        }
    }
}
