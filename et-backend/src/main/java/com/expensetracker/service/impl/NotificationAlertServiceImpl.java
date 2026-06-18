package com.expensetracker.service.impl;

import com.expensetracker.common.ApplicationMessages;
import com.expensetracker.dto.NotificationGenerationSummaryResponse;
import com.expensetracker.dto.NotificationTemplateRecord;
import com.expensetracker.entity.NotificationAlertSettingKey;
import com.expensetracker.entity.NotificationSeverity;
import com.expensetracker.entity.NotificationType;
import com.expensetracker.entity.User;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.repository.NotificationAlertSettingRepository;
import com.expensetracker.repository.NotificationTemplateRepository;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.service.AppNotificationService;
import com.expensetracker.service.NotificationAlertService;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class NotificationAlertServiceImpl
        implements NotificationAlertService {

    private static final BigDecimal ONE_HUNDRED =
            BigDecimal.valueOf(100);

    private final NamedParameterJdbcTemplate jdbcTemplate;

    private final UserRepository userRepository;

    private final AppNotificationService notificationService;

    private final NotificationTemplateRepository
            templateRepository;

    private final NotificationAlertSettingRepository
            settingRepository;

    private final Clock clock;

    public NotificationAlertServiceImpl(
            NamedParameterJdbcTemplate jdbcTemplate,
            UserRepository userRepository,
            AppNotificationService notificationService,
            NotificationTemplateRepository templateRepository,
            NotificationAlertSettingRepository settingRepository,
            Clock clock
    ) {
        this.jdbcTemplate =
                jdbcTemplate;

        this.userRepository =
                userRepository;

        this.notificationService =
                notificationService;

        this.templateRepository =
                templateRepository;

        this.settingRepository =
                settingRepository;

        this.clock =
                clock;
    }

    @Override
    @Transactional
    public NotificationGenerationSummaryResponse
    generateForAuthenticatedUser(
            String authenticatedEmail,
            String month
    ) {
        User user =
                getAuthenticatedUser(
                        authenticatedEmail
                );

        LocalDate today =
                LocalDate.now(clock);

        YearMonth targetMonth =
                resolveMonth(month);

        int goalDeadlineDays =
                settingRepository
                        .getRequiredPositiveInteger(
                                NotificationAlertSettingKey
                                        .GOAL_DEADLINE_DAYS
                        );

        BigDecimal largeExpenseThreshold =
                settingRepository
                        .getRequiredPositiveDecimal(
                                NotificationAlertSettingKey
                                        .LARGE_EXPENSE_THRESHOLD
                        );

        AlertCounter counter =
                new AlertCounter();

        generateBudgetAlerts(
                user.getId(),
                today,
                counter
        );

        generateGoalDeadlineAlerts(
                user.getId(),
                today,
                goalDeadlineDays,
                counter
        );

        generateLargeExpenseAlerts(
                user.getId(),
                targetMonth,
                largeExpenseThreshold,
                counter
        );

        generateMonthlySummaryAlerts(
                user.getId(),
                targetMonth,
                counter
        );

        return counter.toResponse();
    }

    private void generateBudgetAlerts(
            Long userId,
            LocalDate today,
            AlertCounter counter
    ) {
        String sql = """
                SELECT
                    b.public_id,
                    b.name,
                    b.limit_amount,
                    b.currency_code,
                    b.warning_threshold,
                    b.start_date,
                    b.end_date,
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
                    ) AS spent_amount
                FROM budgets b
                WHERE b.user_id = :userId
                  AND b.archived = FALSE
                  AND b.active = TRUE
                  AND :today BETWEEN b.start_date AND b.end_date
                """;

        List<BudgetAlertRecord> budgets =
                jdbcTemplate.query(
                        sql,
                        new MapSqlParameterSource()
                                .addValue(
                                        "userId",
                                        userId
                                )
                                .addValue(
                                        "today",
                                        today
                                ),
                        (resultSet, rowNumber) ->
                                new BudgetAlertRecord(
                                        resultSet.getString(
                                                "public_id"
                                        ),
                                        resultSet.getString(
                                                "name"
                                        ),
                                        money(
                                                resultSet.getBigDecimal(
                                                        "limit_amount"
                                                )
                                        ),
                                        money(
                                                resultSet.getBigDecimal(
                                                        "spent_amount"
                                                )
                                        ),
                                        resultSet.getString(
                                                "currency_code"
                                        ),
                                        resultSet.getInt(
                                                "warning_threshold"
                                        ),
                                        resultSet
                                                .getDate(
                                                        "start_date"
                                                )
                                                .toLocalDate(),
                                        resultSet
                                                .getDate(
                                                        "end_date"
                                                )
                                                .toLocalDate()
                                )
                );

        NotificationTemplateRecord exceededTemplate =
                getTemplate(
                        NotificationType.BUDGET_EXCEEDED
                );

        NotificationTemplateRecord warningTemplate =
                getTemplate(
                        NotificationType.BUDGET_WARNING
                );

        for (BudgetAlertRecord budget : budgets) {
            if (budget.limitAmount().signum() <= 0) {
                continue;
            }

            BigDecimal percentage =
                    budget.spentAmount()
                            .multiply(ONE_HUNDRED)
                            .divide(
                                    budget.limitAmount(),
                                    2,
                                    RoundingMode.HALF_UP
                            );

            Map<String, String> values =
                    Map.of(
                            "budgetName",
                            budget.name(),
                            "percentageUsed",
                            percentage.setScale(
                                    2,
                                    RoundingMode.HALF_UP
                            ) + "%",
                            "spentAmount",
                            formatMoney(
                                    budget.spentAmount(),
                                    budget.currencyCode()
                            ),
                            "limitAmount",
                            formatMoney(
                                    budget.limitAmount(),
                                    budget.currencyCode()
                            )
                    );

            if (
                    budget.spentAmount()
                            .compareTo(
                                    budget.limitAmount()
                            ) >= 0
            ) {
                createNotification(
                        userId,
                        exceededTemplate,
                        budget.publicId(),
                        dedupe(
                                exceededTemplate.notificationType(),
                                budget.publicId(),
                                budget.startDate().toString(),
                                budget.endDate().toString()
                        ),
                        values
                );

                counter.budgetExceededCount++;
                continue;
            }

            if (
                    percentage.compareTo(
                            BigDecimal.valueOf(
                                    budget.warningThreshold()
                            )
                    ) >= 0
            ) {
                createNotification(
                        userId,
                        warningTemplate,
                        budget.publicId(),
                        dedupe(
                                warningTemplate.notificationType(),
                                budget.publicId(),
                                budget.startDate().toString(),
                                budget.endDate().toString()
                        ),
                        values
                );

                counter.budgetWarningCount++;
            }
        }
    }

    private void generateGoalDeadlineAlerts(
            Long userId,
            LocalDate today,
            int goalDeadlineDays,
            AlertCounter counter
    ) {
        LocalDate deadlineEnd =
                today.plusDays(
                        goalDeadlineDays
                );

        String sql = """
                SELECT
                    public_id,
                    name,
                    target_amount,
                    current_amount,
                    currency_code,
                    target_date
                FROM savings_goals
                WHERE user_id = :userId
                  AND status NOT IN ('ARCHIVED', 'COMPLETED')
                  AND target_date BETWEEN :today AND :deadlineEnd
                ORDER BY target_date ASC
                """;

        List<GoalDeadlineRecord> goals =
                jdbcTemplate.query(
                        sql,
                        new MapSqlParameterSource()
                                .addValue(
                                        "userId",
                                        userId
                                )
                                .addValue(
                                        "today",
                                        today
                                )
                                .addValue(
                                        "deadlineEnd",
                                        deadlineEnd
                                ),
                        (resultSet, rowNumber) ->
                                new GoalDeadlineRecord(
                                        resultSet.getString(
                                                "public_id"
                                        ),
                                        resultSet.getString(
                                                "name"
                                        ),
                                        money(
                                                resultSet.getBigDecimal(
                                                        "target_amount"
                                                )
                                        ),
                                        money(
                                                resultSet.getBigDecimal(
                                                        "current_amount"
                                                )
                                        ),
                                        resultSet.getString(
                                                "currency_code"
                                        ),
                                        resultSet
                                                .getDate(
                                                        "target_date"
                                                )
                                                .toLocalDate()
                                )
                );

        NotificationTemplateRecord template =
                getTemplate(
                        NotificationType.GOAL_DEADLINE
                );

        for (GoalDeadlineRecord goal : goals) {
            BigDecimal remainingAmount =
                    money(
                            goal.targetAmount()
                                    .subtract(
                                            goal.currentAmount()
                                    )
                                    .max(BigDecimal.ZERO)
                    );

            createNotification(
                    userId,
                    template,
                    goal.publicId(),
                    dedupe(
                            template.notificationType(),
                            goal.publicId(),
                            goal.targetDate().toString()
                    ),
                    Map.of(
                            "goalName",
                            goal.name(),
                            "targetDate",
                            goal.targetDate().toString(),
                            "remainingAmount",
                            formatMoney(
                                    remainingAmount,
                                    goal.currencyCode()
                            )
                    )
            );

            counter.goalDeadlineCount++;
        }
    }

    private void generateLargeExpenseAlerts(
            Long userId,
            YearMonth targetMonth,
            BigDecimal largeExpenseThreshold,
            AlertCounter counter
    ) {
        BigDecimal threshold =
                money(
                        largeExpenseThreshold
                );

        LocalDate fromDate =
                targetMonth.atDay(1);

        LocalDate toDate =
                targetMonth.atEndOfMonth();

        String sql = """
                SELECT
                    public_id,
                    amount,
                    currency_code,
                    transaction_date
                FROM financial_transactions
                WHERE user_id = :userId
                  AND transaction_type = 'EXPENSE'
                  AND transaction_status = 'POSTED'
                  AND transaction_date BETWEEN :fromDate AND :toDate
                  AND amount >= :threshold
                ORDER BY transaction_date DESC, id DESC
                """;

        List<LargeExpenseRecord> expenses =
                jdbcTemplate.query(
                        sql,
                        new MapSqlParameterSource()
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
                                )
                                .addValue(
                                        "threshold",
                                        threshold
                                ),
                        (resultSet, rowNumber) ->
                                new LargeExpenseRecord(
                                        resultSet.getString(
                                                "public_id"
                                        ),
                                        money(
                                                resultSet.getBigDecimal(
                                                        "amount"
                                                )
                                        ),
                                        resultSet.getString(
                                                "currency_code"
                                        ),
                                        resultSet
                                                .getDate(
                                                        "transaction_date"
                                                )
                                                .toLocalDate()
                                )
                );

        NotificationTemplateRecord template =
                getTemplate(
                        NotificationType.LARGE_EXPENSE
                );

        for (LargeExpenseRecord expense : expenses) {
            createNotification(
                    userId,
                    template,
                    expense.publicId(),
                    dedupe(
                            template.notificationType(),
                            expense.publicId()
                    ),
                    Map.of(
                            "amount",
                            formatMoney(
                                    expense.amount(),
                                    expense.currencyCode()
                            ),
                            "transactionDate",
                            expense.transactionDate().toString()
                    )
            );

            counter.largeExpenseCount++;
        }
    }

    private void generateMonthlySummaryAlerts(
            Long userId,
            YearMonth targetMonth,
            AlertCounter counter
    ) {
        LocalDate fromDate =
                targetMonth.atDay(1);

        LocalDate toDate =
                targetMonth.atEndOfMonth();

        String sql = """
                SELECT
                    currency_code,
                    COALESCE(
                        SUM(
                            CASE
                                WHEN transaction_type = 'INCOME'
                                    THEN amount
                                ELSE 0.00
                            END
                        ),
                        0.00
                    ) AS income_amount,
                    COALESCE(
                        SUM(
                            CASE
                                WHEN transaction_type = 'EXPENSE'
                                    THEN amount
                                ELSE 0.00
                            END
                        ),
                        0.00
                    ) AS expense_amount,
                    COUNT(id) AS transaction_count
                FROM financial_transactions
                WHERE user_id = :userId
                  AND transaction_status = 'POSTED'
                  AND transaction_date BETWEEN :fromDate AND :toDate
                GROUP BY currency_code
                HAVING COUNT(id) > 0
                ORDER BY currency_code ASC
                """;

        List<MonthlySummaryRecord> summaries =
                jdbcTemplate.query(
                        sql,
                        new MapSqlParameterSource()
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
                                ),
                        (resultSet, rowNumber) ->
                                new MonthlySummaryRecord(
                                        resultSet.getString(
                                                "currency_code"
                                        ),
                                        money(
                                                resultSet.getBigDecimal(
                                                        "income_amount"
                                                )
                                        ),
                                        money(
                                                resultSet.getBigDecimal(
                                                        "expense_amount"
                                                )
                                        )
                                )
                );

        NotificationTemplateRecord template =
                getTemplate(
                        NotificationType.MONTHLY_SUMMARY
                );

        for (MonthlySummaryRecord summary : summaries) {
            createNotification(
                    userId,
                    template,
                    targetMonth.toString(),
                    dedupe(
                            template.notificationType(),
                            summary.currencyCode(),
                            targetMonth.toString()
                    ),
                    Map.of(
                            "month",
                            targetMonth.toString(),
                            "incomeAmount",
                            formatMoney(
                                    summary.incomeAmount(),
                                    summary.currencyCode()
                            ),
                            "expenseAmount",
                            formatMoney(
                                    summary.expenseAmount(),
                                    summary.currencyCode()
                            )
                    )
            );

            counter.monthlySummaryCount++;
        }
    }

    private NotificationTemplateRecord getTemplate(
            NotificationType notificationType
    ) {
        return templateRepository
                .findActiveByType(
                        notificationType
                )
                .orElseThrow(
                        () ->
                                new IllegalStateException(
                                        "Missing active notification template for "
                                                + notificationType.name()
                                )
                );
    }

    private void createNotification(
            Long userId,
            NotificationTemplateRecord template,
            String sourcePublicId,
            String dedupeKey,
            Map<String, String> values
    ) {
        notificationService.createOrRefreshForUser(
                userId,
                template.notificationType(),
                template.severity(),
                renderTemplate(
                        template.titleTemplate(),
                        values
                ),
                renderTemplate(
                        template.messageTemplate(),
                        values
                ),
                template.sourceType(),
                sourcePublicId,
                template.actionUrl(),
                dedupeKey
        );
    }

    private String renderTemplate(
            String template,
            Map<String, String> values
    ) {
        String rendered =
                template;

        for (Map.Entry<String, String> entry : values.entrySet()) {
            rendered =
                    rendered.replace(
                            "{"
                                    + entry.getKey()
                                    + "}",
                            entry.getValue()
                    );
        }

        return rendered;
    }

    private User getAuthenticatedUser(
            String authenticatedEmail
    ) {
        if (
                authenticatedEmail == null ||
                authenticatedEmail.isBlank()
        ) {
            throw new ResourceNotFoundException(
                    ApplicationMessages.USER_ACCOUNT_NOT_FOUND
            );
        }

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

    private YearMonth resolveMonth(
            String month
    ) {
        if (
                month == null ||
                month.isBlank()
        ) {
            return YearMonth.now(clock);
        }

        return YearMonth.parse(
                month.trim()
        );
    }

    private BigDecimal money(
            BigDecimal value
    ) {
        if (value == null) {
            return BigDecimal.ZERO.setScale(
                    2,
                    RoundingMode.HALF_UP
            );
        }

        return value.setScale(
                2,
                RoundingMode.HALF_UP
        );
    }

    private String formatMoney(
            BigDecimal amount,
            String currencyCode
    ) {
        return currencyCode
                + " "
                + money(amount).toPlainString();
    }

    private String dedupe(
            NotificationType notificationType,
            String... parts
    ) {
        return notificationType.name()
                + ":"
                + String.join(
                        ":",
                        parts
                );
    }

    private record BudgetAlertRecord(
            String publicId,
            String name,
            BigDecimal limitAmount,
            BigDecimal spentAmount,
            String currencyCode,
            int warningThreshold,
            LocalDate startDate,
            LocalDate endDate
    ) {
    }

    private record GoalDeadlineRecord(
            String publicId,
            String name,
            BigDecimal targetAmount,
            BigDecimal currentAmount,
            String currencyCode,
            LocalDate targetDate
    ) {
    }

    private record LargeExpenseRecord(
            String publicId,
            BigDecimal amount,
            String currencyCode,
            LocalDate transactionDate
    ) {
    }

    private record MonthlySummaryRecord(
            String currencyCode,
            BigDecimal incomeAmount,
            BigDecimal expenseAmount
    ) {
    }

    private static final class AlertCounter {

        private int budgetWarningCount;
        private int budgetExceededCount;
        private int goalDeadlineCount;
        private int largeExpenseCount;
        private int monthlySummaryCount;

        private NotificationGenerationSummaryResponse toResponse() {
            int totalGenerated =
                    budgetWarningCount
                    + budgetExceededCount
                    + goalDeadlineCount
                    + largeExpenseCount
                    + monthlySummaryCount;

            return new NotificationGenerationSummaryResponse(
                    totalGenerated,
                    budgetWarningCount,
                    budgetExceededCount,
                    goalDeadlineCount,
                    largeExpenseCount,
                    monthlySummaryCount
            );
        }
    }
}
