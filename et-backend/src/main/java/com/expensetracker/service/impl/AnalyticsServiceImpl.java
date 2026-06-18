package com.expensetracker.service.impl;

import com.expensetracker.common.AnalyticsMessages;
import com.expensetracker.common.ApplicationMessages;
import com.expensetracker.config.AnalyticsProperties;
import com.expensetracker.dto.AnalyticsResponse;
import com.expensetracker.entity.TransactionType;
import com.expensetracker.entity.User;
import com.expensetracker.exception.BadRequestException;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.repository.AnalyticsJdbcRepository;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.service.AnalyticsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.expensetracker.service.UserTimezoneResolver;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class AnalyticsServiceImpl
        implements AnalyticsService {

    private static final BigDecimal ZERO =
            BigDecimal.ZERO.setScale(2);

    private static final BigDecimal ONE_HUNDRED =
            new BigDecimal("100");

    private static final int MONEY_SCALE = 2;

    private static final int PERCENTAGE_SCALE = 2;

    private final UserRepository userRepository;

    private final AnalyticsJdbcRepository
            analyticsRepository;

    private final AnalyticsProperties
            analyticsProperties;

    private final Clock clock;

    private final UserTimezoneResolver
        userTimezoneResolver;

    public AnalyticsServiceImpl(
        UserRepository userRepository,
        AnalyticsJdbcRepository analyticsRepository,
        AnalyticsProperties analyticsProperties,
        Clock clock,
        UserTimezoneResolver userTimezoneResolver
) {
    this.userRepository =
            userRepository;

    this.analyticsRepository =
            analyticsRepository;

    this.analyticsProperties =
            analyticsProperties;

    this.clock = clock;

    this.userTimezoneResolver =
            userTimezoneResolver;
}

    @Override
    @Transactional(readOnly = true)
    public AnalyticsResponse getAnalytics(
            String authenticatedEmail,
            LocalDate requestedFromDate,
            LocalDate requestedToDate
    ) {
        User user = getUser(
                authenticatedEmail
        );

        ZoneId userZone =
        userTimezoneResolver.resolve(
                user
        );

        LocalDate currentDate =
                LocalDate.now(
                        clock.withZone(userZone)
                );

        DateRange currentRange =
                resolveDateRange(
                        requestedFromDate,
                        requestedToDate,
                        currentDate
                );

        DateRange previousRange =
                resolvePreviousRange(
                        currentRange
                );

        List<String> currencies =
                analyticsRepository
                        .findCurrencies(
                                user.getId(),
                                previousRange.fromDate(),
                                currentRange.toDate()
                        );

        List<AnalyticsJdbcRepository
                .PeriodTotalRecord>
                currentTotalRows =
                analyticsRepository
                        .findPeriodTotals(
                                user.getId(),
                                currentRange.fromDate(),
                                currentRange.toDate()
                        );

        List<AnalyticsJdbcRepository
                .PeriodTotalRecord>
                previousTotalRows =
                analyticsRepository
                        .findPeriodTotals(
                                user.getId(),
                                previousRange.fromDate(),
                                previousRange.toDate()
                        );

        List<AnalyticsJdbcRepository
                .MonthlyTrendRecord>
                monthlyRows =
                analyticsRepository
                        .findMonthlyTrend(
                                user.getId(),
                                currentRange.fromDate(),
                                currentRange.toDate()
                        );

        List<AnalyticsJdbcRepository
                .CategoryBreakdownRecord>
                categoryRows =
                analyticsRepository
                        .findExpenseByCategory(
                                user.getId(),
                                currentRange.fromDate(),
                                currentRange.toDate()
                        );

        List<AnalyticsJdbcRepository
                .AccountBreakdownRecord>
                accountRows =
                analyticsRepository
                        .findExpenseByAccount(
                                user.getId(),
                                currentRange.fromDate(),
                                currentRange.toDate()
                        );

        List<AnalyticsJdbcRepository
                .WeekdayBreakdownRecord>
                weekdayRows =
                analyticsRepository
                        .findExpenseByWeekday(
                                user.getId(),
                                currentRange.fromDate(),
                                currentRange.toDate()
                        );

        Map<String, TotalsAccumulator>
                currentTotals =
                aggregateTotals(
                        currentTotalRows
                );

        Map<String, TotalsAccumulator>
                previousTotals =
                aggregateTotals(
                        previousTotalRows
                );

        List<AnalyticsResponse.CurrencyOverview>
                currencyOverviews =
                currencies.stream()
                        .map(
                                currencyCode ->
                                        buildCurrencyOverview(
                                                currencyCode,
                                                currentRange,
                                                currentTotals
                                                        .getOrDefault(
                                                                currencyCode,
                                                                new TotalsAccumulator()
                                                        ),
                                                previousTotals
                                                        .getOrDefault(
                                                                currencyCode,
                                                                new TotalsAccumulator()
                                                        ),
                                                monthlyRows,
                                                categoryRows,
                                                accountRows,
                                                weekdayRows
                                        )
                        )
                        .toList();

        return new AnalyticsResponse(
                clock.instant(),
                userZone.getId(),
                currentRange.fromDate(),
                currentRange.toDate(),
                previousRange.fromDate(),
                previousRange.toDate(),
                currencyOverviews
        );
    }

    private AnalyticsResponse.CurrencyOverview
    buildCurrencyOverview(
            String currencyCode,
            DateRange currentRange,
            TotalsAccumulator current,
            TotalsAccumulator previous,
            List<AnalyticsJdbcRepository
                    .MonthlyTrendRecord> monthlyRows,
            List<AnalyticsJdbcRepository
                    .CategoryBreakdownRecord> categoryRows,
            List<AnalyticsJdbcRepository
                    .AccountBreakdownRecord> accountRows,
            List<AnalyticsJdbcRepository
                    .WeekdayBreakdownRecord> weekdayRows
    ) {
        AnalyticsResponse.PeriodTotals
                currentPeriod =
                current.toResponse();

        AnalyticsResponse.PeriodTotals
                previousPeriod =
                previous.toResponse();

        return new AnalyticsResponse
                .CurrencyOverview(
                currencyCode,
                currentPeriod,
                previousPeriod,
                buildComparison(
                        currentPeriod,
                        previousPeriod
                ),
                buildMonthlyTrend(
                        currencyCode,
                        currentRange,
                        monthlyRows
                ),
                buildCategoryBreakdown(
                        currencyCode,
                        currentPeriod.expense(),
                        categoryRows
                ),
                buildAccountBreakdown(
                        currencyCode,
                        currentPeriod.expense(),
                        accountRows
                ),
                buildWeekdayBreakdown(
                        currencyCode,
                        currentPeriod.expense(),
                        weekdayRows
                )
        );
    }

    private Map<String, TotalsAccumulator>
    aggregateTotals(
            List<AnalyticsJdbcRepository
                    .PeriodTotalRecord> rows
    ) {
        Map<String, TotalsAccumulator>
                totals =
                new LinkedHashMap<>();

        rows.forEach(
                row ->
                        totals
                                .computeIfAbsent(
                                        row.currencyCode(),
                                        ignored ->
                                                new TotalsAccumulator()
                                )
                                .add(
                                        row.transactionType(),
                                        row.totalAmount(),
                                        row.transactionCount()
                                )
        );

        return totals;
    }

    private List<AnalyticsResponse.MonthlyPoint>
    buildMonthlyTrend(
            String currencyCode,
            DateRange range,
            List<AnalyticsJdbcRepository
                    .MonthlyTrendRecord> rows
    ) {
        Map<YearMonth, MonthlyAccumulator>
                monthlyValues =
                new LinkedHashMap<>();

        rows.stream()
                .filter(
                        row ->
                                row.currencyCode()
                                        .equals(
                                                currencyCode
                                        )
                )
                .forEach(
                        row -> {
                            YearMonth yearMonth =
                                    YearMonth.parse(
                                            row.yearMonth()
                                    );

                            monthlyValues
                                    .computeIfAbsent(
                                            yearMonth,
                                            ignored ->
                                                    new MonthlyAccumulator()
                                    )
                                    .add(
                                            row.transactionType(),
                                            row.totalAmount(),
                                            row.transactionCount()
                                    );
                        }
                );

        List<AnalyticsResponse.MonthlyPoint>
                response =
                new ArrayList<>();

        YearMonth currentMonth =
                YearMonth.from(
                        range.fromDate()
                );

        YearMonth finalMonth =
                YearMonth.from(
                        range.toDate()
                );

        while (
                !currentMonth.isAfter(
                        finalMonth
                )
        ) {
            MonthlyAccumulator accumulator =
                    monthlyValues
                            .getOrDefault(
                                    currentMonth,
                                    new MonthlyAccumulator()
                            );

            LocalDate periodStart =
                    currentMonth
                            .atDay(1)
                            .isBefore(
                                    range.fromDate()
                            )
                            ? range.fromDate()
                            : currentMonth.atDay(1);

            LocalDate periodEnd =
                    currentMonth
                            .atEndOfMonth()
                            .isAfter(
                                    range.toDate()
                            )
                            ? range.toDate()
                            : currentMonth
                                    .atEndOfMonth();

            response.add(
                    accumulator.toResponse(
                            currentMonth.toString(),
                            periodStart,
                            periodEnd
                    )
            );

            currentMonth =
                    currentMonth.plusMonths(1);
        }

        return List.copyOf(response);
    }

    private List<AnalyticsResponse
            .CategoryBreakdown>
    buildCategoryBreakdown(
            String currencyCode,
            BigDecimal totalExpense,
            List<AnalyticsJdbcRepository
                    .CategoryBreakdownRecord> rows
    ) {
        List<AnalyticsJdbcRepository
                .CategoryBreakdownRecord>
                matchingRows =
                rows.stream()
                        .filter(
                                row ->
                                        row.currencyCode()
                                                .equals(
                                                        currencyCode
                                                )
                        )
                        .sorted(
                                Comparator
                                        .comparing(
                                                AnalyticsJdbcRepository
                                                        .CategoryBreakdownRecord
                                                        ::totalAmount
                                        )
                                        .reversed()
                        )
                        .toList();

        int limit =
                analyticsProperties
                        .topCategoryLimit();

        List<AnalyticsResponse.CategoryBreakdown>
                response =
                new ArrayList<>();

        matchingRows.stream()
                .limit(limit)
                .map(
                        row ->
                                new AnalyticsResponse
                                        .CategoryBreakdown(
                                        row.categoryPublicId(),
                                        row.categoryName(),
                                        row.iconKey(),
                                        row.colorKey(),
                                        normalizeMoney(
                                                row.totalAmount()
                                        ),
                                        row.transactionCount(),
                                        calculateShare(
                                                row.totalAmount(),
                                                totalExpense
                                        )
                                )
                )
                .forEach(response::add);

        if (matchingRows.size() > limit) {
            BigDecimal remainingAmount =
                    matchingRows.stream()
                            .skip(limit)
                            .map(
                                    AnalyticsJdbcRepository
                                            .CategoryBreakdownRecord
                                            ::totalAmount
                            )
                            .reduce(
                                    BigDecimal.ZERO,
                                    BigDecimal::add
                            );

            long remainingCount =
                    matchingRows.stream()
                            .skip(limit)
                            .mapToLong(
                                    AnalyticsJdbcRepository
                                            .CategoryBreakdownRecord
                                            ::transactionCount
                            )
                            .sum();

            response.add(
                    new AnalyticsResponse
                            .CategoryBreakdown(
                            null,
                            "Other categories",
                            "ELLIPSIS",
                            "SLATE",
                            normalizeMoney(
                                    remainingAmount
                            ),
                            remainingCount,
                            calculateShare(
                                    remainingAmount,
                                    totalExpense
                            )
                    )
            );
        }

        return List.copyOf(response);
    }

    private List<AnalyticsResponse
            .AccountBreakdown>
    buildAccountBreakdown(
            String currencyCode,
            BigDecimal totalExpense,
            List<AnalyticsJdbcRepository
                    .AccountBreakdownRecord> rows
    ) {
        List<AnalyticsJdbcRepository
                .AccountBreakdownRecord>
                matchingRows =
                rows.stream()
                        .filter(
                                row ->
                                        row.currencyCode()
                                                .equals(
                                                        currencyCode
                                                )
                        )
                        .sorted(
                                Comparator
                                        .comparing(
                                                AnalyticsJdbcRepository
                                                        .AccountBreakdownRecord
                                                        ::totalAmount
                                        )
                                        .reversed()
                        )
                        .toList();

        int limit =
                analyticsProperties
                        .topAccountLimit();

        List<AnalyticsResponse.AccountBreakdown>
                response =
                new ArrayList<>();

        matchingRows.stream()
                .limit(limit)
                .map(
                        row ->
                                new AnalyticsResponse
                                        .AccountBreakdown(
                                        row.accountPublicId(),
                                        row.accountName(),
                                        row.accountType(),
                                        normalizeMoney(
                                                row.totalAmount()
                                        ),
                                        row.transactionCount(),
                                        calculateShare(
                                                row.totalAmount(),
                                                totalExpense
                                        )
                                )
                )
                .forEach(response::add);

        if (matchingRows.size() > limit) {
            BigDecimal remainingAmount =
                    matchingRows.stream()
                            .skip(limit)
                            .map(
                                    AnalyticsJdbcRepository
                                            .AccountBreakdownRecord
                                            ::totalAmount
                            )
                            .reduce(
                                    BigDecimal.ZERO,
                                    BigDecimal::add
                            );

            long remainingCount =
                    matchingRows.stream()
                            .skip(limit)
                            .mapToLong(
                                    AnalyticsJdbcRepository
                                            .AccountBreakdownRecord
                                            ::transactionCount
                            )
                            .sum();

            response.add(
                    new AnalyticsResponse
                            .AccountBreakdown(
                            null,
                            "Other accounts",
                            null,
                            normalizeMoney(
                                    remainingAmount
                            ),
                            remainingCount,
                            calculateShare(
                                    remainingAmount,
                                    totalExpense
                            )
                    )
            );
        }

        return List.copyOf(response);
    }

    private List<AnalyticsResponse
            .WeekdayBreakdown>
    buildWeekdayBreakdown(
            String currencyCode,
            BigDecimal totalExpense,
            List<AnalyticsJdbcRepository
                    .WeekdayBreakdownRecord> rows
    ) {
        Map<Integer, AnalyticsJdbcRepository
                .WeekdayBreakdownRecord>
                values =
                new LinkedHashMap<>();

        rows.stream()
                .filter(
                        row ->
                                row.currencyCode()
                                        .equals(
                                                currencyCode
                                        )
                )
                .forEach(
                        row ->
                                values.put(
                                        row.weekdayIndex(),
                                        row
                                )
                );

        List<AnalyticsResponse.WeekdayBreakdown>
                response =
                new ArrayList<>();

        for (
                int weekdayIndex = 0;
                weekdayIndex < 7;
                weekdayIndex++
        ) {
            AnalyticsJdbcRepository
                    .WeekdayBreakdownRecord row =
                    values.get(
                            weekdayIndex
                    );

            BigDecimal amount =
                    row == null
                            ? ZERO
                            : row.totalAmount();

            long transactionCount =
                    row == null
                            ? 0L
                            : row.transactionCount();

            DayOfWeek dayOfWeek =
                    DayOfWeek.of(
                            weekdayIndex + 1
                    );

            response.add(
                    new AnalyticsResponse
                            .WeekdayBreakdown(
                            weekdayIndex,
                            dayOfWeek.getDisplayName(
                                    TextStyle.FULL,
                                    Locale.ENGLISH
                            ),
                            normalizeMoney(amount),
                            transactionCount,
                            calculateShare(
                                    amount,
                                    totalExpense
                            )
                    )
            );
        }

        return List.copyOf(response);
    }

    private AnalyticsResponse.Comparison
    buildComparison(
            AnalyticsResponse.PeriodTotals current,
            AnalyticsResponse.PeriodTotals previous
    ) {
        return new AnalyticsResponse.Comparison(
                calculatePercentageChange(
                        current.income(),
                        previous.income()
                ),
                calculatePercentageChange(
                        current.expense(),
                        previous.expense()
                ),
                calculatePercentageChange(
                        current.transferVolume(),
                        previous.transferVolume()
                ),
                normalizeMoney(
                        current.netCashFlow()
                                .subtract(
                                        previous.netCashFlow()
                                )
                ),
                calculateSavingsRate(
                        current.income(),
                        current.netCashFlow()
                ),
                calculateSavingsRate(
                        previous.income(),
                        previous.netCashFlow()
                )
        );
    }

    private BigDecimal calculatePercentageChange(
            BigDecimal current,
            BigDecimal previous
    ) {
        if (previous.compareTo(BigDecimal.ZERO) == 0) {
            return current.compareTo(
                    BigDecimal.ZERO
            ) == 0
                    ? BigDecimal.ZERO
                            .setScale(
                                    PERCENTAGE_SCALE
                            )
                    : null;
        }

        return current
                .subtract(previous)
                .divide(
                        previous.abs(),
                        8,
                        RoundingMode.HALF_UP
                )
                .multiply(
                        ONE_HUNDRED
                )
                .setScale(
                        PERCENTAGE_SCALE,
                        RoundingMode.HALF_UP
                );
    }

    private BigDecimal calculateSavingsRate(
            BigDecimal income,
            BigDecimal netCashFlow
    ) {
        if (
                income.compareTo(
                        BigDecimal.ZERO
                ) <= 0
        ) {
            return null;
        }

        return netCashFlow
                .divide(
                        income,
                        8,
                        RoundingMode.HALF_UP
                )
                .multiply(
                        ONE_HUNDRED
                )
                .setScale(
                        PERCENTAGE_SCALE,
                        RoundingMode.HALF_UP
                );
    }

    private BigDecimal calculateShare(
            BigDecimal amount,
            BigDecimal total
    ) {
        if (
                total == null
                || total.compareTo(
                        BigDecimal.ZERO
                ) <= 0
        ) {
            return BigDecimal.ZERO
                    .setScale(
                            PERCENTAGE_SCALE
                    );
        }

        return amount
                .divide(
                        total,
                        8,
                        RoundingMode.HALF_UP
                )
                .multiply(
                        ONE_HUNDRED
                )
                .setScale(
                        PERCENTAGE_SCALE,
                        RoundingMode.HALF_UP
                );
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
                    AnalyticsMessages
                            .DATE_RANGE_PAIR_REQUIRED
            );
        }

        LocalDate fromDate;
        LocalDate toDate;

        if (!fromProvided) {
            toDate = currentDate;

            fromDate =
                    currentDate
                            .minusMonths(
                                    analyticsProperties
                                            .defaultMonths()
                                            - 1L
                            )
                            .withDayOfMonth(1);
        } else {
            fromDate =
                    requestedFromDate;

            toDate =
                    requestedToDate;
        }

        if (fromDate.isAfter(toDate)) {
            throw new BadRequestException(
                    AnalyticsMessages
                            .DATE_RANGE_INVALID
            );
        }

        if (toDate.isAfter(currentDate)) {
            throw new BadRequestException(
                    AnalyticsMessages
                            .FUTURE_DATE_NOT_ALLOWED
            );
        }

        long rangeDays =
                ChronoUnit.DAYS.between(
                        fromDate,
                        toDate
                ) + 1L;

        if (
                rangeDays >
                analyticsProperties
                        .maxRangeDays()
        ) {
            throw new BadRequestException(
                    AnalyticsMessages
                            .DATE_RANGE_TOO_LARGE
                            .formatted(
                                    analyticsProperties
                                            .maxRangeDays()
                            )
            );
        }

        return new DateRange(
                fromDate,
                toDate
        );
    }

    private DateRange resolvePreviousRange(
            DateRange currentRange
    ) {
        long periodLength =
                ChronoUnit.DAYS.between(
                        currentRange.fromDate(),
                        currentRange.toDate()
                ) + 1L;

        LocalDate previousToDate =
                currentRange
                        .fromDate()
                        .minusDays(1);

        LocalDate previousFromDate =
                previousToDate.minusDays(
                        periodLength - 1L
                );

        return new DateRange(
                previousFromDate,
                previousToDate
        );
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

    private BigDecimal normalizeMoney(
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

    private record DateRange(

            LocalDate fromDate,

            LocalDate toDate
    ) {
    }

    private final class TotalsAccumulator {

        private BigDecimal income =
                ZERO;

        private BigDecimal expense =
                ZERO;

        private BigDecimal transferVolume =
                ZERO;

        private long incomeCount;

        private long expenseCount;

        private long transferCount;

        private void add(
                TransactionType transactionType,
                BigDecimal amount,
                long transactionCount
        ) {
            BigDecimal normalizedAmount =
                    normalizeMoney(amount);

            switch (transactionType) {
                case INCOME -> {
                    income =
                            income.add(
                                    normalizedAmount
                            );

                    incomeCount +=
                            transactionCount;
                }

                case EXPENSE -> {
                    expense =
                            expense.add(
                                    normalizedAmount
                            );

                    expenseCount +=
                            transactionCount;
                }

                case TRANSFER -> {
                    transferVolume =
                            transferVolume.add(
                                    normalizedAmount
                            );

                    transferCount +=
                            transactionCount;
                }
            }
        }

        private AnalyticsResponse.PeriodTotals
        toResponse() {
            BigDecimal averageExpense =
                    expenseCount == 0
                            ? ZERO
                            : expense.divide(
                                    BigDecimal.valueOf(
                                            expenseCount
                                    ),
                                    MONEY_SCALE,
                                    RoundingMode.HALF_EVEN
                            );

            return new AnalyticsResponse
                    .PeriodTotals(
                    normalizeMoney(income),
                    normalizeMoney(expense),
                    normalizeMoney(
                            income.subtract(
                                    expense
                            )
                    ),
                    normalizeMoney(
                            transferVolume
                    ),
                    normalizeMoney(
                            averageExpense
                    ),
                    incomeCount
                            + expenseCount
                            + transferCount,
                    incomeCount,
                    expenseCount,
                    transferCount
            );
        }
    }

    private final class MonthlyAccumulator {

        private BigDecimal income =
                ZERO;

        private BigDecimal expense =
                ZERO;

        private BigDecimal transferVolume =
                ZERO;

        private long transactionCount;

        private void add(
                TransactionType transactionType,
                BigDecimal amount,
                long count
        ) {
            BigDecimal normalizedAmount =
                    normalizeMoney(amount);

            switch (transactionType) {
                case INCOME ->
                        income =
                                income.add(
                                        normalizedAmount
                                );

                case EXPENSE ->
                        expense =
                                expense.add(
                                        normalizedAmount
                                );

                case TRANSFER ->
                        transferVolume =
                                transferVolume.add(
                                        normalizedAmount
                                );
            }

            transactionCount += count;
        }

        private AnalyticsResponse.MonthlyPoint
        toResponse(
                String yearMonth,
                LocalDate periodStart,
                LocalDate periodEnd
        ) {
            return new AnalyticsResponse
                    .MonthlyPoint(
                    yearMonth,
                    periodStart,
                    periodEnd,
                    normalizeMoney(income),
                    normalizeMoney(expense),
                    normalizeMoney(
                            income.subtract(
                                    expense
                            )
                    ),
                    normalizeMoney(
                            transferVolume
                    ),
                    transactionCount
            );
        }
    }
}