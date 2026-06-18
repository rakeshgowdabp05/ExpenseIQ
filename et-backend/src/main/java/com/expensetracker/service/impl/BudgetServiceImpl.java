package com.expensetracker.service.impl;

import com.expensetracker.common.BudgetMessages;
import com.expensetracker.common.BudgetValidationConstants;
import com.expensetracker.dto.BudgetCreateRequest;
import com.expensetracker.dto.BudgetCurrencySummaryResponse;
import com.expensetracker.dto.BudgetResponse;
import com.expensetracker.dto.BudgetStatusUpdateRequest;
import com.expensetracker.dto.BudgetSummaryResponse;
import com.expensetracker.dto.BudgetUpdateRequest;
import com.expensetracker.entity.BudgetPeriodType;
import com.expensetracker.entity.BudgetStatus;
import com.expensetracker.repository.BudgetJdbcRepository;
import com.expensetracker.service.BudgetService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class BudgetServiceImpl
        implements BudgetService {

    private static final BigDecimal ONE_HUNDRED =
            BigDecimal.valueOf(100);

    private static final int MONEY_SCALE =
            2;

    private final BudgetJdbcRepository repository;

    public BudgetServiceImpl(
            BudgetJdbcRepository repository
    ) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public BudgetResponse create(
            String authenticatedEmail,
            BudgetCreateRequest request
    ) {
        long userId =
                requireUserId(
                        authenticatedEmail
                );

        Long categoryId =
                resolveCategoryId(
                        userId,
                        request.categoryPublicId()
                );

        ResolvedPeriod period =
                resolvePeriod(
                        request.periodType(),
                        request.month(),
                        request.startDate(),
                        request.endDate()
                );

        String currencyCode =
                normalizeCurrency(
                        request.currencyCode()
                );

        int warningThreshold =
                resolveWarningThreshold(
                        request.warningThreshold()
                );

        ensureNoOverlap(
                userId,
                categoryId,
                currencyCode,
                period,
                null
        );

        String publicId =
                repository.insert(
                        userId,
                        categoryId,
                        normalizeName(
                                request.name()
                        ),
                        normalizeMoney(
                                request.limitAmount()
                        ),
                        currencyCode,
                        request.periodType(),
                        period.startDate(),
                        period.endDate(),
                        warningThreshold
                );

        return getRequiredBudget(
                userId,
                publicId
        );
    }

    @Override
    @Transactional
    public BudgetResponse update(
            String authenticatedEmail,
            String publicId,
            BudgetUpdateRequest request
    ) {
        long userId =
                requireUserId(
                        authenticatedEmail
                );

        BudgetJdbcRepository.BudgetRecord currentBudget =
                requireBudgetRecord(
                        userId,
                        publicId
                );

        Long categoryId =
                resolveCategoryId(
                        userId,
                        request.categoryPublicId()
                );

        ResolvedPeriod period =
                resolvePeriod(
                        request.periodType(),
                        request.month(),
                        request.startDate(),
                        request.endDate()
                );

        String currencyCode =
                normalizeCurrency(
                        request.currencyCode()
                );

        int warningThreshold =
                resolveWarningThreshold(
                        request.warningThreshold()
                );

        if (currentBudget.active()) {
            ensureNoOverlap(
                    userId,
                    categoryId,
                    currencyCode,
                    period,
                    currentBudget.id()
            );
        }

        int updatedRows =
                repository.update(
                        userId,
                        publicId,
                        categoryId,
                        normalizeName(
                                request.name()
                        ),
                        normalizeMoney(
                                request.limitAmount()
                        ),
                        currencyCode,
                        request.periodType(),
                        period.startDate(),
                        period.endDate(),
                        warningThreshold
                );

        if (updatedRows == 0) {
            throw notFound(
                    BudgetMessages.BUDGET_NOT_FOUND
            );
        }

        return getRequiredBudget(
                userId,
                publicId
        );
    }

    @Override
    @Transactional
    public BudgetResponse updateStatus(
            String authenticatedEmail,
            String publicId,
            BudgetStatusUpdateRequest request
    ) {
        long userId =
                requireUserId(
                        authenticatedEmail
                );

        BudgetJdbcRepository.BudgetRecord budget =
                requireBudgetRecord(
                        userId,
                        publicId
                );

        boolean nextActive =
                Boolean.TRUE.equals(
                        request.active()
                );

        if (
                nextActive
                        && !budget.active()
        ) {
            ensureNoOverlap(
                    userId,
                    budget.categoryId(),
                    budget.currencyCode(),
                    new ResolvedPeriod(
                            budget.startDate(),
                            budget.endDate()
                    ),
                    budget.id()
            );
        }

        int updatedRows =
                repository.updateActiveStatus(
                        userId,
                        publicId,
                        nextActive
                );

        if (updatedRows == 0) {
            throw notFound(
                    BudgetMessages.BUDGET_NOT_FOUND
            );
        }

        return getRequiredBudget(
                userId,
                publicId
        );
    }

    @Override
    @Transactional(readOnly = true)
    public BudgetResponse getByPublicId(
            String authenticatedEmail,
            String publicId
    ) {
        long userId =
                requireUserId(
                        authenticatedEmail
                );

        return getRequiredBudget(
                userId,
                publicId
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<BudgetResponse> getBudgets(
            String authenticatedEmail,
            String month,
            Boolean active
    ) {
        long userId =
                requireUserId(
                        authenticatedEmail
                );

        YearMonth selectedMonth =
                parseOptionalMonth(month);

        LocalDate periodStart =
                selectedMonth == null
                        ? null
                        : selectedMonth.atDay(1);

        LocalDate periodEnd =
                selectedMonth == null
                        ? null
                        : selectedMonth.atEndOfMonth();

        return repository
                .findAll(
                        userId,
                        periodStart,
                        periodEnd,
                        active
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public BudgetSummaryResponse getSummary(
            String authenticatedEmail,
            String month
    ) {
        long userId =
                requireUserId(
                        authenticatedEmail
                );

        YearMonth selectedMonth =
                month == null
                        || month.isBlank()
                        ? YearMonth.now()
                        : parseRequiredMonth(month);

        LocalDate periodStart =
                selectedMonth.atDay(1);

        LocalDate periodEnd =
                selectedMonth.atEndOfMonth();

        List<BudgetResponse> budgets =
                repository
                        .findAll(
                                userId,
                                periodStart,
                                periodEnd,
                                null
                        )
                        .stream()
                        .map(this::toResponse)
                        .toList();

        int onTrackCount = 0;
        int warningCount = 0;
        int exceededCount = 0;
        int inactiveCount = 0;

        Map<String, CurrencyAccumulator> currencyAccumulators =
                new LinkedHashMap<>();

        for (BudgetResponse budget : budgets) {
            switch (budget.status()) {
                case ON_TRACK ->
                        onTrackCount++;

                case WARNING ->
                        warningCount++;

                case EXCEEDED ->
                        exceededCount++;

                case INACTIVE ->
                        inactiveCount++;
            }

            if (!budget.active()) {
                continue;
            }

            CurrencyAccumulator accumulator =
                    currencyAccumulators
                            .computeIfAbsent(
                                    budget.currencyCode(),
                                    ignored ->
                                            new CurrencyAccumulator()
                            );

            if (budget.overallBudget()) {
                accumulator.overallLimit =
                        accumulator.overallLimit.add(
                                budget.limitAmount()
                        );

                accumulator.overallSpent =
                        accumulator.overallSpent.add(
                                budget.spentAmount()
                        );
            } else {
                accumulator.categoryLimit =
                        accumulator.categoryLimit.add(
                                budget.limitAmount()
                        );

                accumulator.categorySpent =
                        accumulator.categorySpent.add(
                                budget.spentAmount()
                        );
            }
        }

        List<BudgetCurrencySummaryResponse> currencies =
                new ArrayList<>();

        currencyAccumulators.forEach(
                (currencyCode, accumulator) ->
                        currencies.add(
                                new BudgetCurrencySummaryResponse(
                                        currencyCode,
                                        normalizeMoney(
                                                accumulator.overallLimit
                                        ),
                                        normalizeMoney(
                                                accumulator.overallSpent
                                        ),
                                        normalizeMoney(
                                                accumulator.categoryLimit
                                        ),
                                        normalizeMoney(
                                                accumulator.categorySpent
                                        )
                                )
                        )
        );

        return new BudgetSummaryResponse(
                periodStart,
                periodEnd,
                budgets.size(),
                onTrackCount,
                warningCount,
                exceededCount,
                inactiveCount,
                List.copyOf(currencies)
        );
    }

    @Override
    @Transactional
    public void archive(
            String authenticatedEmail,
            String publicId
    ) {
        long userId =
                requireUserId(
                        authenticatedEmail
                );

        requireBudgetRecord(
                userId,
                publicId
        );

        int updatedRows =
                repository.archive(
                        userId,
                        publicId
                );

        if (updatedRows == 0) {
            throw notFound(
                    BudgetMessages.BUDGET_NOT_FOUND
            );
        }
    }

    private long requireUserId(
            String authenticatedEmail
    ) {
        if (
                authenticatedEmail == null
                        || authenticatedEmail.isBlank()
        ) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    BudgetMessages.USER_NOT_FOUND
            );
        }

        return repository
                .findUserIdByEmail(
                        authenticatedEmail
                )
                .orElseThrow(
                        () ->
                                new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED,
                                        BudgetMessages.USER_NOT_FOUND
                                )
                );
    }

    private Long resolveCategoryId(
            long userId,
            String categoryPublicId
    ) {
        if (
                categoryPublicId == null
                        || categoryPublicId.isBlank()
        ) {
            return null;
        }

        BudgetJdbcRepository.CategoryRecord category =
                repository
                        .findExpenseCategory(
                                userId,
                                categoryPublicId.trim()
                        )
                        .orElseThrow(
                                () ->
                                        notFound(
                                                BudgetMessages.CATEGORY_NOT_FOUND
                                        )
                        );

        if (
                !"EXPENSE".equals(
                        category.categoryType()
                )
        ) {
            throw badRequest(
                    BudgetMessages.CATEGORY_MUST_BE_EXPENSE
            );
        }

        if (!category.active()) {
            throw badRequest(
                    BudgetMessages.CATEGORY_INACTIVE
            );
        }

        return category.id();
    }

    private ResolvedPeriod resolvePeriod(
            BudgetPeriodType periodType,
            String month,
            LocalDate startDate,
            LocalDate endDate
    ) {
        if (
                periodType == BudgetPeriodType.MONTHLY
        ) {
            if (
                    month == null
                            || month.isBlank()
            ) {
                throw badRequest(
                        BudgetMessages.MONTH_REQUIRED
                );
            }

            YearMonth selectedMonth =
                    parseRequiredMonth(month);

            return new ResolvedPeriod(
                    selectedMonth.atDay(1),
                    selectedMonth.atEndOfMonth()
            );
        }

        if (
                startDate == null
                        || endDate == null
        ) {
            throw badRequest(
                    BudgetMessages.CUSTOM_DATES_REQUIRED
            );
        }

        if (endDate.isBefore(startDate)) {
            throw badRequest(
                    BudgetMessages.INVALID_DATE_RANGE
            );
        }

        return new ResolvedPeriod(
                startDate,
                endDate
        );
    }

    private YearMonth parseOptionalMonth(
            String month
    ) {
        if (
                month == null
                        || month.isBlank()
        ) {
            return null;
        }

        return parseRequiredMonth(month);
    }

    private YearMonth parseRequiredMonth(
            String month
    ) {
        try {
            return YearMonth.parse(
                    month.trim()
            );
        } catch (DateTimeParseException exception) {
            throw badRequest(
                    BudgetMessages.INVALID_MONTH
            );
        }
    }

    private void ensureNoOverlap(
            long userId,
            Long categoryId,
            String currencyCode,
            ResolvedPeriod period,
            Long excludedBudgetId
    ) {
        boolean overlapping =
                repository.existsOverlappingBudget(
                        userId,
                        categoryId,
                        currencyCode,
                        period.startDate(),
                        period.endDate(),
                        excludedBudgetId
                );

        if (overlapping) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    BudgetMessages.OVERLAPPING_BUDGET
            );
        }
    }

    private BudgetJdbcRepository.BudgetRecord requireBudgetRecord(
            long userId,
            String publicId
    ) {
        return repository
                .findByPublicId(
                        userId,
                        publicId
                )
                .orElseThrow(
                        () ->
                                notFound(
                                        BudgetMessages.BUDGET_NOT_FOUND
                                )
                );
    }

    private BudgetResponse getRequiredBudget(
            long userId,
            String publicId
    ) {
        return toResponse(
                requireBudgetRecord(
                        userId,
                        publicId
                )
        );
    }

    private BudgetResponse toResponse(
            BudgetJdbcRepository.BudgetRecord record
    ) {
        BigDecimal limitAmount =
                normalizeMoney(
                        record.limitAmount()
                );

        BigDecimal spentAmount =
                normalizeMoney(
                        record.spentAmount()
                );

        BigDecimal remainingAmount =
                normalizeMoney(
                        limitAmount.subtract(
                                spentAmount
                        )
                );

        BigDecimal percentageUsed =
                calculatePercentageUsed(
                        spentAmount,
                        limitAmount
                );

        BudgetStatus status =
                calculateStatus(
                        record.active(),
                        spentAmount,
                        limitAmount,
                        percentageUsed,
                        record.warningThreshold()
                );

        return new BudgetResponse(
                record.publicId(),
                record.name(),
                record.categoryPublicId(),
                record.categoryName(),
                record.categoryId() == null,
                limitAmount,
                spentAmount,
                remainingAmount,
                percentageUsed,
                record.currencyCode(),
                record.periodType(),
                record.startDate(),
                record.endDate(),
                record.warningThreshold(),
                status,
                record.active(),
                record.createdAt(),
                record.updatedAt()
        );
    }

    private BigDecimal calculatePercentageUsed(
            BigDecimal spentAmount,
            BigDecimal limitAmount
    ) {
        if (
                limitAmount == null
                        || limitAmount.compareTo(
                                BigDecimal.ZERO
                        ) <= 0
        ) {
            return BigDecimal.ZERO.setScale(
                    MONEY_SCALE,
                    RoundingMode.HALF_UP
            );
        }

        return spentAmount
                .multiply(ONE_HUNDRED)
                .divide(
                        limitAmount,
                        MONEY_SCALE,
                        RoundingMode.HALF_UP
                );
    }

    private BudgetStatus calculateStatus(
            boolean active,
            BigDecimal spentAmount,
            BigDecimal limitAmount,
            BigDecimal percentageUsed,
            int warningThreshold
    ) {
        if (!active) {
            return BudgetStatus.INACTIVE;
        }

        if (
                spentAmount.compareTo(limitAmount)
                        >= 0
        ) {
            return BudgetStatus.EXCEEDED;
        }

        if (
                percentageUsed.compareTo(
                        BigDecimal.valueOf(
                                warningThreshold
                        )
                ) >= 0
        ) {
            return BudgetStatus.WARNING;
        }

        return BudgetStatus.ON_TRACK;
    }

    private String normalizeName(
            String name
    ) {
        return name.trim();
    }

    private String normalizeCurrency(
            String currencyCode
    ) {
        return currencyCode
                .trim()
                .toUpperCase(
                        Locale.ROOT
                );
    }

    private int resolveWarningThreshold(
            Integer warningThreshold
    ) {
        return warningThreshold == null
                ? BudgetValidationConstants
                        .DEFAULT_WARNING_THRESHOLD
                : warningThreshold;
    }

    private BigDecimal normalizeMoney(
            BigDecimal value
    ) {
        if (value == null) {
            return BigDecimal.ZERO.setScale(
                    MONEY_SCALE,
                    RoundingMode.HALF_UP
            );
        }

        return value.setScale(
                MONEY_SCALE,
                RoundingMode.HALF_UP
        );
    }

    private ResponseStatusException badRequest(
            String message
    ) {
        return new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                message
        );
    }

    private ResponseStatusException notFound(
            String message
    ) {
        return new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                message
        );
    }

    private record ResolvedPeriod(
            LocalDate startDate,
            LocalDate endDate
    ) {
    }

    private static final class CurrencyAccumulator {

        private BigDecimal overallLimit =
                BigDecimal.ZERO;

        private BigDecimal overallSpent =
                BigDecimal.ZERO;

        private BigDecimal categoryLimit =
                BigDecimal.ZERO;

        private BigDecimal categorySpent =
                BigDecimal.ZERO;
    }
}