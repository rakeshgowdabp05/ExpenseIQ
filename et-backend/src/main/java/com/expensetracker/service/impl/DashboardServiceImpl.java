package com.expensetracker.service.impl;

import com.expensetracker.common.ApplicationMessages;
import com.expensetracker.config.DashboardProperties;
import com.expensetracker.dto.BudgetResponse;
import com.expensetracker.dto.BudgetSummaryResponse;
import com.expensetracker.dto.DashboardBalanceSummaryResponse;
import com.expensetracker.dto.DashboardBudgetOverviewResponse;
import com.expensetracker.dto.DashboardCashFlowSummaryResponse;
import com.expensetracker.dto.DashboardGoalOverviewResponse;
import com.expensetracker.dto.DashboardResponse;
import com.expensetracker.dto.DashboardTransactionCountResponse;
import com.expensetracker.dto.GoalResponse;
import com.expensetracker.dto.GoalSummaryResponse;
import com.expensetracker.dto.TransactionResponse;
import com.expensetracker.entity.BudgetStatus;
import com.expensetracker.entity.FinancialAccount;
import com.expensetracker.entity.GoalStatus;
import com.expensetracker.entity.TransactionStatus;
import com.expensetracker.entity.TransactionType;
import com.expensetracker.entity.User;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.mapper.FinancialTransactionMapper;
import com.expensetracker.repository.DashboardCashFlowProjection;
import com.expensetracker.repository.DashboardTransactionStatusProjection;
import com.expensetracker.repository.FinancialAccountRepository;
import com.expensetracker.repository.FinancialTransactionRepository;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.service.BudgetService;
import com.expensetracker.service.DashboardService;
import com.expensetracker.service.SavingsGoalService;
import com.expensetracker.service.UserTimezoneResolver;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardServiceImpl
        implements DashboardService {

    private static final BigDecimal ZERO =
            BigDecimal.ZERO;

    private static final Comparator<BudgetResponse>
            BUDGET_RISK_COMPARATOR =
            Comparator
                    .comparingInt(
                            (
                                    BudgetResponse budget
                            ) -> getBudgetRiskRank(
                                    budget.status()
                            )
                    )
                    .thenComparing(
                            BudgetResponse::percentageUsed
                    )
                    .thenComparing(
                            BudgetResponse::updatedAt
                    );

    private static final Comparator<GoalResponse>
            GOAL_PROGRESS_COMPARATOR =
            Comparator
                    .comparing(
                            GoalResponse::progressPercentage
                    )
                    .thenComparing(
                            GoalResponse::currentAmount
                    )
                    .thenComparing(
                            GoalResponse::targetDate,
                            Comparator.reverseOrder()
                    );

    private static final Comparator<GoalResponse>
            GOAL_TARGET_DATE_COMPARATOR =
            Comparator
                    .comparing(
                            GoalResponse::targetDate
                    )
                    .thenComparing(
                            GoalResponse::createdAt
                    );

    private final UserRepository userRepository;

    private final FinancialAccountRepository
            financialAccountRepository;

    private final FinancialTransactionRepository
            financialTransactionRepository;

    private final FinancialTransactionMapper
            financialTransactionMapper;

    private final BudgetService budgetService;

    private final SavingsGoalService
            savingsGoalService;

    private final DashboardProperties
            dashboardProperties;

    private final Clock clock;

    private final UserTimezoneResolver
            userTimezoneResolver;

    public DashboardServiceImpl(
            UserRepository userRepository,
            FinancialAccountRepository
                    financialAccountRepository,
            FinancialTransactionRepository
                    financialTransactionRepository,
            FinancialTransactionMapper
                    financialTransactionMapper,
            BudgetService budgetService,
            SavingsGoalService savingsGoalService,
            DashboardProperties dashboardProperties,
            Clock clock,
            UserTimezoneResolver userTimezoneResolver
    ) {
        this.userRepository =
                userRepository;

        this.financialAccountRepository =
                financialAccountRepository;

        this.financialTransactionRepository =
                financialTransactionRepository;

        this.financialTransactionMapper =
                financialTransactionMapper;

        this.budgetService =
                budgetService;

        this.savingsGoalService =
                savingsGoalService;

        this.dashboardProperties =
                dashboardProperties;

        this.clock =
                clock;

        this.userTimezoneResolver =
                userTimezoneResolver;
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(
            String authenticatedEmail
    ) {
        User user =
                getUser(
                        authenticatedEmail
                );

        ZoneId userZone =
                userTimezoneResolver.resolve(
                        user
                );

        LocalDate currentDate =
                LocalDate.now(
                        clock.withZone(
                                userZone
                        )
                );

        LocalDate periodStart =
                currentDate.withDayOfMonth(
                        1
                );

        LocalDate periodEnd =
                currentDate.withDayOfMonth(
                        currentDate.lengthOfMonth()
                );

        List<FinancialAccount> accounts =
                financialAccountRepository
                        .findAllByUserIdOrderByCreatedAtDesc(
                                user.getId()
                        );

        long activeAccountCount =
                accounts.stream()
                        .filter(
                                FinancialAccount::isActive
                        )
                        .count();

        List<DashboardBalanceSummaryResponse>
                balancesByCurrency =
                buildBalanceSummaries(
                        accounts
                );

        List<DashboardCashFlowProjection>
                cashFlowRows =
                financialTransactionRepository
                        .findDashboardCashFlow(
                                user.getId(),
                                TransactionStatus.POSTED,
                                periodStart,
                                periodEnd
                        );

        List<DashboardCashFlowSummaryResponse>
                cashFlowSummaries =
                buildCashFlowSummaries(
                        cashFlowRows
                );

        DashboardTransactionCountResponse
                transactionCounts =
                buildTransactionCounts(
                        financialTransactionRepository
                                .findDashboardTransactionStatusCounts(
                                        user.getId()
                                )
                );

        DashboardBudgetOverviewResponse
                budgetOverview =
                buildBudgetOverview(
                        authenticatedEmail,
                        currentDate
                );

        DashboardGoalOverviewResponse
                goalOverview =
                buildGoalOverview(
                        authenticatedEmail,
                        currentDate
                );

        List<TransactionResponse>
                recentTransactions =
                financialTransactionRepository
                        .findRecentOwnedTransactions(
                                user.getId(),
                                PageRequest.of(
                                        0,
                                        dashboardProperties
                                                .recentTransactionLimit()
                                )
                        )
                        .stream()
                        .map(
                                financialTransactionMapper
                                        ::toResponse
                        )
                        .toList();

        return new DashboardResponse(
                clock.instant(),
                userZone.getId(),
                periodStart,
                periodEnd,
                accounts.size(),
                activeAccountCount,
                balancesByCurrency,
                cashFlowSummaries,
                transactionCounts,
                budgetOverview,
                goalOverview,
                recentTransactions
        );
    }

    private DashboardBudgetOverviewResponse
    buildBudgetOverview(
            String authenticatedEmail,
            LocalDate currentDate
    ) {
        String month =
                YearMonth
                        .from(
                                currentDate
                        )
                        .toString();

        BudgetSummaryResponse summary =
                budgetService.getSummary(
                        authenticatedEmail,
                        month
                );

        List<BudgetResponse> budgets =
                budgetService.getBudgets(
                        authenticatedEmail,
                        month,
                        null
                );

        BudgetResponse overallBudget =
                findHighestRiskBudget(
                        budgets,
                        true
                );

        BudgetResponse
                highestRiskCategoryBudget =
                findHighestRiskBudget(
                        budgets,
                        false
                );

        return new DashboardBudgetOverviewResponse(
                summary,
                overallBudget,
                highestRiskCategoryBudget
        );
    }

    private BudgetResponse findHighestRiskBudget(
            List<BudgetResponse> budgets,
            boolean overallBudget
    ) {
        return budgets.stream()
                .filter(
                        BudgetResponse::active
                )
                .filter(
                        budget ->
                                budget.overallBudget()
                                        == overallBudget
                )
                .max(
                        BUDGET_RISK_COMPARATOR
                )
                .orElse(null);
    }

    private DashboardGoalOverviewResponse
    buildGoalOverview(
            String authenticatedEmail,
            LocalDate currentDate
    ) {
        GoalSummaryResponse summary =
                savingsGoalService.getSummary(
                        authenticatedEmail
                );

        List<GoalResponse> goals =
                savingsGoalService.getGoals(
                        authenticatedEmail,
                        null
                );

        return new DashboardGoalOverviewResponse(
                summary,
                findNearestUpcomingGoal(
                        goals,
                        currentDate
                ),
                findHighestProgressGoal(
                        goals
                )
        );
    }

    private GoalResponse findNearestUpcomingGoal(
            List<GoalResponse> goals,
            LocalDate currentDate
    ) {
        return goals.stream()
                .filter(
                        goal ->
                                goal.status()
                                        != GoalStatus.COMPLETED
                )
                .filter(
                        goal ->
                                !goal.targetDate()
                                        .isBefore(
                                                currentDate
                                        )
                )
                .min(
                        GOAL_TARGET_DATE_COMPARATOR
                )
                .orElse(null);
    }

    private GoalResponse findHighestProgressGoal(
            List<GoalResponse> goals
    ) {
        List<GoalResponse> activeGoals =
                goals.stream()
                        .filter(
                                this::isActiveGoal
                        )
                        .toList();

        List<GoalResponse> candidates =
                activeGoals.isEmpty()
                        ? goals
                        : activeGoals;

        return candidates.stream()
                .max(
                        GOAL_PROGRESS_COMPARATOR
                )
                .orElse(null);
    }

    private boolean isActiveGoal(
            GoalResponse goal
    ) {
        return switch (
                goal.status()
        ) {
            case IN_PROGRESS,
                 PAUSED,
                 OVERDUE -> true;

            case COMPLETED,
                 ARCHIVED -> false;
        };
    }

    private static int getBudgetRiskRank(
            BudgetStatus status
    ) {
        if (status == null) {
            return 0;
        }

        return switch (status) {
            case INACTIVE -> 1;
            case ON_TRACK -> 2;
            case WARNING -> 3;
            case EXCEEDED -> 4;
        };
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

    private List<DashboardBalanceSummaryResponse>
    buildBalanceSummaries(
            List<FinancialAccount> accounts
    ) {
        Map<String, BalanceAccumulator>
                balances =
                new LinkedHashMap<>();

        accounts.stream()
                .filter(
                        FinancialAccount::isActive
                )
                .filter(
                        FinancialAccount
                                ::isIncludeInTotal
                )
                .sorted(
                        Comparator.comparing(
                                FinancialAccount
                                        ::getCurrencyCode
                        )
                )
                .forEach(
                        account -> {
                            BalanceAccumulator
                                    accumulator =
                                    balances
                                            .computeIfAbsent(
                                                    account
                                                            .getCurrencyCode(),
                                                    ignored ->
                                                            new BalanceAccumulator()
                                            );

                            accumulator.add(
                                    account
                                            .getCurrentBalance()
                            );
                        }
                );

        return balances.entrySet()
                .stream()
                .map(
                        entry ->
                                new DashboardBalanceSummaryResponse(
                                        entry.getKey(),
                                        entry.getValue()
                                                .totalBalance,
                                        entry.getValue()
                                                .accountCount
                                )
                )
                .toList();
    }

    private List<DashboardCashFlowSummaryResponse>
    buildCashFlowSummaries(
            List<DashboardCashFlowProjection>
                    projections
    ) {
        Map<String, CashFlowAccumulator>
                cashFlows =
                new LinkedHashMap<>();

        projections.stream()
                .sorted(
                        Comparator.comparing(
                                DashboardCashFlowProjection
                                        ::getCurrencyCode
                        )
                )
                .forEach(
                        projection -> {
                            CashFlowAccumulator
                                    accumulator =
                                    cashFlows
                                            .computeIfAbsent(
                                                    projection
                                                            .getCurrencyCode(),
                                                    ignored ->
                                                            new CashFlowAccumulator()
                                            );

                            accumulator.add(
                                    projection
                                            .getTransactionType(),
                                    defaultAmount(
                                            projection
                                                    .getTotalAmount()
                                    ),
                                    defaultCount(
                                            projection
                                                    .getTransactionCount()
                                    )
                            );
                        }
                );

        List<DashboardCashFlowSummaryResponse>
                responses =
                new ArrayList<>();

        cashFlows.forEach(
                (
                        currencyCode,
                        accumulator
                ) ->
                        responses.add(
                                accumulator
                                        .toResponse(
                                                currencyCode
                                        )
                        )
        );

        return List.copyOf(
                responses
        );
    }

    private DashboardTransactionCountResponse
    buildTransactionCounts(
            List<DashboardTransactionStatusProjection>
                    projections
    ) {
        Map<TransactionStatus, Long> counts =
                new EnumMap<>(
                        TransactionStatus.class
                );

        projections.forEach(
                projection ->
                        counts.put(
                                projection
                                        .getTransactionStatus(),
                                defaultCount(
                                        projection
                                                .getTransactionCount()
                                )
                        )
        );

        long posted =
                counts.getOrDefault(
                        TransactionStatus.POSTED,
                        0L
                );

        long cancelled =
                counts.getOrDefault(
                        TransactionStatus.CANCELLED,
                        0L
                );

        return new DashboardTransactionCountResponse(
                posted,
                cancelled,
                posted + cancelled
        );
    }

    private BigDecimal defaultAmount(
            BigDecimal amount
    ) {
        return amount == null
                ? ZERO
                : amount;
    }

    private long defaultCount(
            Long count
    ) {
        return count == null
                ? 0L
                : count;
    }

    private static final class
    BalanceAccumulator {

        private BigDecimal totalBalance =
                ZERO;

        private long accountCount;

        private void add(
                BigDecimal balance
        ) {
            totalBalance =
                    totalBalance.add(
                            balance == null
                                    ? ZERO
                                    : balance
                    );

            accountCount++;
        }
    }

    private static final class
    CashFlowAccumulator {

        private BigDecimal income =
                ZERO;

        private BigDecimal expense =
                ZERO;

        private BigDecimal transferVolume =
                ZERO;

        private long postedTransactionCount;

        private void add(
                TransactionType type,
                BigDecimal amount,
                long transactionCount
        ) {
            if (type == null) {
                return;
            }

            switch (type) {
                case INCOME ->
                        income =
                                income.add(
                                        amount
                                );

                case EXPENSE ->
                        expense =
                                expense.add(
                                        amount
                                );

                case TRANSFER ->
                        transferVolume =
                                transferVolume.add(
                                        amount
                                );
            }

            postedTransactionCount +=
                    transactionCount;
        }

        private DashboardCashFlowSummaryResponse
        toResponse(
                String currencyCode
        ) {
            return new DashboardCashFlowSummaryResponse(
                    currencyCode,
                    income,
                    expense,
                    income.subtract(
                            expense
                    ),
                    transferVolume,
                    postedTransactionCount
            );
        }
    }
}