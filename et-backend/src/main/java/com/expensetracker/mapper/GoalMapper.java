package com.expensetracker.mapper;

import com.expensetracker.common.GoalValidationConstants;
import com.expensetracker.dto.GoalAccountSummaryResponse;
import com.expensetracker.dto.GoalContributionResponse;
import com.expensetracker.dto.GoalResponse;
import com.expensetracker.entity.FinancialAccount;
import com.expensetracker.entity.GoalContribution;
import com.expensetracker.entity.GoalStatus;
import com.expensetracker.entity.SavingsGoal;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Component
public class GoalMapper {

    private static final BigDecimal ONE_HUNDRED =
            BigDecimal.valueOf(100);

    private final Clock clock;

    public GoalMapper(
            Clock clock
    ) {
        this.clock = clock;
    }

    public GoalResponse toResponse(
            SavingsGoal goal
    ) {
        BigDecimal targetAmount =
                normalizeMoney(
                        goal.getTargetAmount()
                );

        BigDecimal currentAmount =
                normalizeMoney(
                        goal.getCurrentAmount()
                );

        BigDecimal safeCurrentAmount =
                currentAmount.min(
                        targetAmount
                );

        BigDecimal remainingAmount =
                normalizeMoney(
                        targetAmount
                                .subtract(
                                        safeCurrentAmount
                                )
                                .max(
                                        BigDecimal.ZERO
                                )
                );

        BigDecimal progressPercentage =
                calculateProgressPercentage(
                        safeCurrentAmount,
                        targetAmount
                );

        GoalStatus effectiveStatus =
                resolveEffectiveStatus(goal);

        LocalDate today =
                LocalDate.now(clock);

        long daysRemaining =
                calculateDaysRemaining(
                        today,
                        goal.getTargetDate()
                );

        return new GoalResponse(
                goal.getPublicId(),
                goal.getName(),
                goal.getDescription(),
                targetAmount,
                safeCurrentAmount,
                remainingAmount,
                progressPercentage,
                goal.getCurrencyCode(),
                goal.getTargetDate(),
                daysRemaining,
                effectiveStatus,
                effectiveStatus == GoalStatus.OVERDUE,
                goal.getCompletedAt(),
                goal.getCreatedAt(),
                goal.getUpdatedAt()
        );
    }

    public GoalContributionResponse toContributionResponse(
            GoalContribution contribution
    ) {
        return new GoalContributionResponse(
                contribution.getPublicId(),
                contribution
                        .getGoal()
                        .getPublicId(),
                toAccountSummary(
                        contribution
                                .getSourceAccount()
                ),
                normalizeMoney(
                        contribution.getAmount()
                ),
                contribution.getCurrencyCode(),
                contribution.getContributionDate(),
                contribution.getNote(),
                contribution.getReferenceNumber(),
                contribution.getStatus(),
                contribution.getCancelledAt(),
                contribution.getCreatedAt(),
                contribution.getUpdatedAt()
        );
    }

    public GoalStatus resolveEffectiveStatus(
            SavingsGoal goal
    ) {
        if (
                goal.getStatus()
                        == GoalStatus.ARCHIVED
        ) {
            return GoalStatus.ARCHIVED;
        }

        BigDecimal targetAmount =
                normalizeMoney(
                        goal.getTargetAmount()
                );

        BigDecimal currentAmount =
                normalizeMoney(
                        goal.getCurrentAmount()
                );

        if (
                goal.getStatus()
                        == GoalStatus.COMPLETED
                || currentAmount.compareTo(
                        targetAmount
                ) >= 0
        ) {
            return GoalStatus.COMPLETED;
        }

        if (
                goal.getStatus()
                        == GoalStatus.PAUSED
        ) {
            return GoalStatus.PAUSED;
        }

        if (
                goal.getTargetDate()
                        .isBefore(
                                LocalDate.now(clock)
                        )
        ) {
            return GoalStatus.OVERDUE;
        }

        return GoalStatus.IN_PROGRESS;
    }

    private BigDecimal calculateProgressPercentage(
            BigDecimal currentAmount,
            BigDecimal targetAmount
    ) {
        if (
                targetAmount == null
                || targetAmount.compareTo(
                        BigDecimal.ZERO
                ) <= 0
        ) {
            return zeroMoney();
        }

        BigDecimal percentage =
                currentAmount
                        .multiply(ONE_HUNDRED)
                        .divide(
                                targetAmount,
                                GoalValidationConstants
                                        .MONEY_SCALE,
                                RoundingMode.HALF_UP
                        );

        return normalizeMoney(
                percentage.min(ONE_HUNDRED)
        );
    }

    private long calculateDaysRemaining(
            LocalDate today,
            LocalDate targetDate
    ) {
        if (targetDate == null) {
            return 0L;
        }

        return Math.max(
                0L,
                ChronoUnit.DAYS.between(
                        today,
                        targetDate
                )
        );
    }

    private GoalAccountSummaryResponse toAccountSummary(
            FinancialAccount account
    ) {
        if (account == null) {
            return null;
        }

        return new GoalAccountSummaryResponse(
                account.getPublicId(),
                account.getName(),
                account.getAccountType(),
                account.getCurrencyCode()
        );
    }

    private BigDecimal normalizeMoney(
            BigDecimal value
    ) {
        if (value == null) {
            return zeroMoney();
        }

        return value.setScale(
                GoalValidationConstants.MONEY_SCALE,
                RoundingMode.HALF_UP
        );
    }

    private BigDecimal zeroMoney() {
        return BigDecimal.ZERO.setScale(
                GoalValidationConstants.MONEY_SCALE,
                RoundingMode.HALF_UP
        );
    }
}