package com.expensetracker.service.impl;

import com.expensetracker.common.ApplicationMessages;
import com.expensetracker.common.GoalMessages;
import com.expensetracker.common.GoalValidationConstants;
import com.expensetracker.dto.GoalContributionCreateRequest;
import com.expensetracker.dto.GoalContributionResponse;
import com.expensetracker.dto.GoalCreateRequest;
import com.expensetracker.dto.GoalCurrencySummaryResponse;
import com.expensetracker.dto.GoalResponse;
import com.expensetracker.dto.GoalStatusUpdateRequest;
import com.expensetracker.dto.GoalSummaryResponse;
import com.expensetracker.dto.GoalUpdateRequest;
import com.expensetracker.entity.FinancialAccount;
import com.expensetracker.entity.GoalContribution;
import com.expensetracker.entity.GoalContributionStatus;
import com.expensetracker.entity.GoalStatus;
import com.expensetracker.entity.SavingsGoal;
import com.expensetracker.entity.User;
import com.expensetracker.exception.BadRequestException;
import com.expensetracker.exception.ConflictException;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.mapper.GoalMapper;
import com.expensetracker.repository.FinancialAccountRepository;
import com.expensetracker.repository.GoalContributionRepository;
import com.expensetracker.repository.SavingsGoalRepository;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.service.SavingsGoalService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class SavingsGoalServiceImpl
        implements SavingsGoalService {

    private final SavingsGoalRepository
            savingsGoalRepository;

    private final GoalContributionRepository
            goalContributionRepository;

    private final FinancialAccountRepository
            financialAccountRepository;

    private final UserRepository userRepository;

    private final GoalMapper goalMapper;

    private final Clock clock;

    public SavingsGoalServiceImpl(
            SavingsGoalRepository
                    savingsGoalRepository,
            GoalContributionRepository
                    goalContributionRepository,
            FinancialAccountRepository
                    financialAccountRepository,
            UserRepository userRepository,
            GoalMapper goalMapper,
            Clock clock
    ) {
        this.savingsGoalRepository =
                savingsGoalRepository;

        this.goalContributionRepository =
                goalContributionRepository;

        this.financialAccountRepository =
                financialAccountRepository;

        this.userRepository =
                userRepository;

        this.goalMapper =
                goalMapper;

        this.clock =
                clock;
    }

    @Override
    @Transactional
    public GoalResponse createGoal(
            String authenticatedEmail,
            GoalCreateRequest request
    ) {
        User user =
                getAuthenticatedUser(
                        authenticatedEmail
                );

        validateTargetDate(
                request.targetDate()
        );

        String normalizedName =
                normalizeName(
                        request.name()
                );

        ensureUniqueName(
                user.getId(),
                normalizedName,
                null
        );

        SavingsGoal goal =
                new SavingsGoal();

        goal.setUser(user);
        goal.setName(normalizedName);
        goal.setDescription(
                normalizeOptionalText(
                        request.description()
                )
        );
        goal.setTargetAmount(
                normalizeMoney(
                        request.targetAmount()
                )
        );
        goal.setCurrentAmount(
                zeroMoney()
        );
        goal.setCurrencyCode(
                normalizeCurrency(
                        request.currencyCode()
                )
        );
        goal.setTargetDate(
                request.targetDate()
        );
        goal.setStatus(
                GoalStatus.IN_PROGRESS
        );

        return goalMapper.toResponse(
                saveGoal(goal)
        );
    }

    @Override
    @Transactional
    public GoalResponse updateGoal(
            String authenticatedEmail,
            String publicId,
            GoalUpdateRequest request
    ) {
        User user =
                getAuthenticatedUser(
                        authenticatedEmail
                );

        SavingsGoal goal =
                getGoalForUpdate(
                        user.getId(),
                        publicId
                );

        validateTargetDate(
                request.targetDate()
        );

        String normalizedName =
                normalizeName(
                        request.name()
                );

        ensureUniqueName(
                user.getId(),
                normalizedName,
                goal.getId()
        );

        BigDecimal targetAmount =
                normalizeMoney(
                        request.targetAmount()
                );

        BigDecimal currentAmount =
                normalizeMoney(
                        goal.getCurrentAmount()
                );

        if (
                targetAmount.compareTo(
                        currentAmount
                ) < 0
        ) {
            throw new BadRequestException(
                    GoalMessages
                            .TARGET_BELOW_CURRENT_AMOUNT
            );
        }

        String currencyCode =
                normalizeCurrency(
                        request.currencyCode()
                );

        if (
                currentAmount.signum() > 0
                && !currencyCode.equals(
                        goal.getCurrencyCode()
                )
        ) {
            throw new BadRequestException(
                    GoalMessages
                            .CURRENCY_CHANGE_NOT_ALLOWED
            );
        }

        goal.setName(normalizedName);
        goal.setDescription(
                normalizeOptionalText(
                        request.description()
                )
        );
        goal.setTargetAmount(targetAmount);
        goal.setCurrencyCode(currencyCode);
        goal.setTargetDate(
                request.targetDate()
        );

        synchronizeCompletionStatus(goal);

        return goalMapper.toResponse(
                saveGoal(goal)
        );
    }

    @Override
    @Transactional
    public GoalResponse updateStatus(
            String authenticatedEmail,
            String publicId,
            GoalStatusUpdateRequest request
    ) {
        User user =
                getAuthenticatedUser(
                        authenticatedEmail
                );

        SavingsGoal goal =
                getGoalForUpdate(
                        user.getId(),
                        publicId
                );

        GoalStatus requestedStatus =
                request.status();

        if (
                requestedStatus
                        == GoalStatus.ARCHIVED
        ) {
            throw new BadRequestException(
                    GoalMessages
                            .ARCHIVE_STATUS_MANAGED_SEPARATELY
            );
        }

        if (
                requestedStatus
                        == GoalStatus.OVERDUE
        ) {
            throw new BadRequestException(
                    GoalMessages
                            .OVERDUE_STATUS_AUTOMATIC
            );
        }

        if (
                goal.getStatus()
                        == GoalStatus.COMPLETED
                && requestedStatus
                        != GoalStatus.COMPLETED
        ) {
            throw new ConflictException(
                    GoalMessages
                            .STATUS_CHANGE_INVALID
            );
        }

        if (
                requestedStatus
                        == GoalStatus.COMPLETED
        ) {
            if (
                    normalizeMoney(
                            goal.getCurrentAmount()
                    ).compareTo(
                            normalizeMoney(
                                    goal.getTargetAmount()
                            )
                    ) < 0
            ) {
                throw new ConflictException(
                        GoalMessages
                                .GOAL_NOT_FULLY_FUNDED
                );
            }

            goal.setStatus(
                    GoalStatus.COMPLETED
            );

            if (
                    goal.getCompletedAt()
                            == null
            ) {
                goal.setCompletedAt(
                        clock.instant()
                );
            }
        } else {
            goal.setStatus(
                    requestedStatus
            );
            goal.setCompletedAt(null);
        }

        return goalMapper.toResponse(
                saveGoal(goal)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public GoalResponse getGoal(
            String authenticatedEmail,
            String publicId
    ) {
        User user =
                getAuthenticatedUser(
                        authenticatedEmail
                );

        SavingsGoal goal =
                savingsGoalRepository
                        .findByPublicIdAndUserIdAndStatusNot(
                                normalizeIdentifier(
                                        publicId
                                ),
                                user.getId(),
                                GoalStatus.ARCHIVED
                        )
                        .orElseThrow(
                                this::goalNotFound
                        );

        return goalMapper.toResponse(goal);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GoalResponse> getGoals(
            String authenticatedEmail,
            GoalStatus status
    ) {
        User user =
                getAuthenticatedUser(
                        authenticatedEmail
                );

        return savingsGoalRepository
                .findVisibleGoals(
                        user.getId(),
                        GoalStatus.ARCHIVED
                )
                .stream()
                .map(goalMapper::toResponse)
                .filter(
                        goal ->
                                status == null
                                || goal.status()
                                        == status
                )
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public GoalSummaryResponse getSummary(
            String authenticatedEmail
    ) {
        User user =
                getAuthenticatedUser(
                        authenticatedEmail
                );

        List<SavingsGoal> goals =
                savingsGoalRepository
                        .findVisibleGoals(
                                user.getId(),
                                GoalStatus.ARCHIVED
                        );

        int inProgressCount = 0;
        int pausedCount = 0;
        int completedCount = 0;
        int overdueCount = 0;

        Map<String, CurrencyAccumulator>
                accumulators =
                new LinkedHashMap<>();

        for (SavingsGoal goal : goals) {
            GoalStatus effectiveStatus =
                    goalMapper
                            .resolveEffectiveStatus(
                                    goal
                            );

            switch (effectiveStatus) {
                case IN_PROGRESS ->
                        inProgressCount++;

                case PAUSED ->
                        pausedCount++;

                case COMPLETED ->
                        completedCount++;

                case OVERDUE ->
                        overdueCount++;

                case ARCHIVED -> {
                    // Archived goals are excluded.
                }
            }

            CurrencyAccumulator accumulator =
                    accumulators.computeIfAbsent(
                            goal.getCurrencyCode(),
                            ignored ->
                                    new CurrencyAccumulator()
                    );

            BigDecimal targetAmount =
                    normalizeMoney(
                            goal.getTargetAmount()
                    );

            BigDecimal currentAmount =
                    normalizeMoney(
                            goal.getCurrentAmount()
                    );

            accumulator.targetAmount =
                    accumulator.targetAmount.add(
                            targetAmount
                    );

            accumulator.savedAmount =
                    accumulator.savedAmount.add(
                            currentAmount
                    );
        }

        List<GoalCurrencySummaryResponse>
                currencies =
                new ArrayList<>();

        accumulators.forEach(
                (currencyCode, accumulator) -> {
                    BigDecimal targetAmount =
                            normalizeMoney(
                                    accumulator
                                            .targetAmount
                            );

                    BigDecimal savedAmount =
                            normalizeMoney(
                                    accumulator
                                            .savedAmount
                            );

                    currencies.add(
                            new GoalCurrencySummaryResponse(
                                    currencyCode,
                                    targetAmount,
                                    savedAmount,
                                    normalizeMoney(
                                            targetAmount
                                                    .subtract(
                                                            savedAmount
                                                    )
                                                    .max(
                                                            BigDecimal.ZERO
                                                    )
                                    )
                            )
                    );
                }
        );

        return new GoalSummaryResponse(
                goals.size(),
                inProgressCount,
                pausedCount,
                completedCount,
                overdueCount,
                List.copyOf(currencies)
        );
    }

    @Override
    @Transactional
    public void archiveGoal(
            String authenticatedEmail,
            String publicId
    ) {
        User user =
                getAuthenticatedUser(
                        authenticatedEmail
                );

        SavingsGoal goal =
                getGoalForUpdate(
                        user.getId(),
                        publicId
                );

        goal.setStatus(
                GoalStatus.ARCHIVED
        );
        goal.setArchivedAt(
                clock.instant()
        );

        savingsGoalRepository.saveAndFlush(
                goal
        );
    }

    @Override
    @Transactional
    public GoalContributionResponse
    addContribution(
            String authenticatedEmail,
            String goalPublicId,
            GoalContributionCreateRequest request
    ) {
        User user =
                getAuthenticatedUser(
                        authenticatedEmail
                );

        SavingsGoal goal =
                getGoalForUpdate(
                        user.getId(),
                        goalPublicId
                );

        ensureContributionAllowed(goal);

        BigDecimal amount =
                normalizeMoney(
                        request.amount()
                );

        BigDecimal remainingAmount =
                normalizeMoney(
                        goal.getTargetAmount()
                                .subtract(
                                        goal.getCurrentAmount()
                                )
                );

        if (
                amount.compareTo(
                        remainingAmount
                ) > 0
        ) {
            throw new BadRequestException(
                    GoalMessages
                            .CONTRIBUTION_EXCEEDS_REMAINING
            );
        }

        FinancialAccount sourceAccount =
                resolveAndDebitSourceAccount(
                        user.getId(),
                        request
                                .sourceAccountPublicId(),
                        goal.getCurrencyCode(),
                        amount
                );

        GoalContribution contribution =
                new GoalContribution();

        contribution.setUser(user);
        contribution.setGoal(goal);
        contribution.setSourceAccount(
                sourceAccount
        );
        contribution.setAmount(amount);
        contribution.setCurrencyCode(
                goal.getCurrencyCode()
        );
        contribution.setContributionDate(
                request.contributionDate()
        );
        contribution.setNote(
                normalizeOptionalText(
                        request.note()
                )
        );
        contribution.setReferenceNumber(
                normalizeOptionalText(
                        request.referenceNumber()
                )
        );
        contribution.setStatus(
                GoalContributionStatus.POSTED
        );

        goal.setCurrentAmount(
                normalizeMoney(
                        goal.getCurrentAmount()
                                .add(amount)
                )
        );

        synchronizeCompletionStatus(goal);

        savingsGoalRepository.save(goal);

        GoalContribution savedContribution =
                goalContributionRepository
                        .saveAndFlush(
                                contribution
                        );

        return goalMapper
                .toContributionResponse(
                        savedContribution
                );
    }

    @Override
    @Transactional(readOnly = true)
    public List<GoalContributionResponse>
    getContributions(
            String authenticatedEmail,
            String goalPublicId
    ) {
        User user =
                getAuthenticatedUser(
                        authenticatedEmail
                );

        SavingsGoal goal =
                savingsGoalRepository
                        .findByPublicIdAndUserIdAndStatusNot(
                                normalizeIdentifier(
                                        goalPublicId
                                ),
                                user.getId(),
                                GoalStatus.ARCHIVED
                        )
                        .orElseThrow(
                                this::goalNotFound
                        );

        return goalContributionRepository
                .findGoalContributions(
                        user.getId(),
                        goal.getId()
                )
                .stream()
                .map(
                        goalMapper
                                ::toContributionResponse
                )
                .toList();
    }

    @Override
    @Transactional
    public void cancelContribution(
            String authenticatedEmail,
            String goalPublicId,
            String contributionPublicId
    ) {
        User user =
                getAuthenticatedUser(
                        authenticatedEmail
                );

        SavingsGoal goal =
                getGoalForUpdate(
                        user.getId(),
                        goalPublicId
                );

        GoalContribution contribution =
                goalContributionRepository
                        .findOwnedContributionForUpdate(
                                normalizeIdentifier(
                                        contributionPublicId
                                ),
                                normalizeIdentifier(
                                        goalPublicId
                                ),
                                user.getId()
                        )
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                GoalMessages
                                                        .CONTRIBUTION_NOT_FOUND
                                        )
                        );

        if (
                contribution.getStatus()
                        == GoalContributionStatus.CANCELLED
        ) {
            throw new ConflictException(
                    GoalMessages
                            .CONTRIBUTION_ALREADY_CANCELLED
            );
        }

        FinancialAccount sourceAccount =
                contribution
                        .getSourceAccount();

        if (sourceAccount != null) {
            FinancialAccount lockedAccount =
                    lockSourceAccount(
                            user.getId(),
                            sourceAccount
                                    .getPublicId()
                    );

            lockedAccount.setCurrentBalance(
                    normalizeMoney(
                            lockedAccount
                                    .getCurrentBalance()
                                    .add(
                                            contribution
                                                    .getAmount()
                                    )
                    )
            );

            financialAccountRepository.save(
                    lockedAccount
            );
        }

        goal.setCurrentAmount(
                normalizeMoney(
                        goal.getCurrentAmount()
                                .subtract(
                                        contribution
                                                .getAmount()
                                )
                                .max(
                                        BigDecimal.ZERO
                                )
                )
        );

        if (
                goal.getStatus()
                        == GoalStatus.COMPLETED
        ) {
            goal.setStatus(
                    GoalStatus.IN_PROGRESS
            );
            goal.setCompletedAt(null);
        }

        contribution.setStatus(
                GoalContributionStatus.CANCELLED
        );
        contribution.setCancelledAt(
                clock.instant()
        );

        savingsGoalRepository.save(goal);

        goalContributionRepository
                .saveAndFlush(
                        contribution
                );
    }

    private User getAuthenticatedUser(
            String authenticatedEmail
    ) {
        if (
                authenticatedEmail == null
                || authenticatedEmail.isBlank()
        ) {
            throw new ResourceNotFoundException(
                    ApplicationMessages
                            .USER_ACCOUNT_NOT_FOUND
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

    private SavingsGoal getGoalForUpdate(
            Long userId,
            String publicId
    ) {
        return savingsGoalRepository
                .findOwnedByPublicIdForUpdate(
                        normalizeIdentifier(
                                publicId
                        ),
                        userId,
                        GoalStatus.ARCHIVED
                )
                .orElseThrow(
                        this::goalNotFound
                );
    }

    private FinancialAccount
    resolveAndDebitSourceAccount(
            Long userId,
            String sourceAccountPublicId,
            String goalCurrencyCode,
            BigDecimal amount
    ) {
        if (
                sourceAccountPublicId == null
                || sourceAccountPublicId.isBlank()
        ) {
            return null;
        }

        FinancialAccount account =
                lockSourceAccount(
                        userId,
                        sourceAccountPublicId
                );

        if (!account.isActive()) {
            throw new BadRequestException(
                    GoalMessages
                            .ACCOUNT_INACTIVE
            );
        }

        if (
                !account.getCurrencyCode()
                        .equals(
                                goalCurrencyCode
                        )
        ) {
            throw new BadRequestException(
                    GoalMessages
                            .ACCOUNT_CURRENCY_MISMATCH
            );
        }

        if (
                normalizeMoney(
                        account.getCurrentBalance()
                ).compareTo(amount) < 0
        ) {
            throw new BadRequestException(
                    GoalMessages
                            .INSUFFICIENT_ACCOUNT_BALANCE
            );
        }

        account.setCurrentBalance(
                normalizeMoney(
                        account.getCurrentBalance()
                                .subtract(amount)
                )
        );

        return financialAccountRepository
                .save(account);
    }

    private FinancialAccount lockSourceAccount(
            Long userId,
            String accountPublicId
    ) {
        String normalizedPublicId =
                normalizeIdentifier(
                        accountPublicId
                );

        List<FinancialAccount> accounts =
                financialAccountRepository
                        .findOwnedByPublicIdsForUpdate(
                                userId,
                                Set.of(
                                        normalizedPublicId
                                )
                        );

        if (accounts.size() != 1) {
            throw new ResourceNotFoundException(
                    GoalMessages
                            .ACCOUNT_NOT_FOUND
            );
        }

        return accounts.getFirst();
    }

    private void ensureContributionAllowed(
            SavingsGoal goal
    ) {
        if (
                goal.getStatus()
                        == GoalStatus.PAUSED
        ) {
            throw new ConflictException(
                    GoalMessages.GOAL_PAUSED
            );
        }

        if (
                goal.getStatus()
                        == GoalStatus.COMPLETED
        ) {
            throw new ConflictException(
                    GoalMessages.GOAL_COMPLETED
            );
        }

        if (
                goal.getStatus()
                        == GoalStatus.ARCHIVED
        ) {
            throw goalNotFound();
        }
    }

    private void synchronizeCompletionStatus(
            SavingsGoal goal
    ) {
        BigDecimal currentAmount =
                normalizeMoney(
                        goal.getCurrentAmount()
                );

        BigDecimal targetAmount =
                normalizeMoney(
                        goal.getTargetAmount()
                );

        if (
                currentAmount.compareTo(
                        targetAmount
                ) >= 0
        ) {
            goal.setCurrentAmount(
                    targetAmount
            );
            goal.setStatus(
                    GoalStatus.COMPLETED
            );

            if (
                    goal.getCompletedAt()
                            == null
            ) {
                goal.setCompletedAt(
                        clock.instant()
                );
            }

            return;
        }

        if (
                goal.getStatus()
                        == GoalStatus.COMPLETED
        ) {
            goal.setStatus(
                    GoalStatus.IN_PROGRESS
            );
            goal.setCompletedAt(null);
        }
    }

    private void ensureUniqueName(
            Long userId,
            String name,
            Long excludedId
    ) {
        boolean exists =
                excludedId == null
                        ? savingsGoalRepository
                                .existsVisibleByName(
                                        userId,
                                        name,
                                        GoalStatus.ARCHIVED
                                )
                        : savingsGoalRepository
                                .existsVisibleByNameExcludingId(
                                        userId,
                                        name,
                                        GoalStatus.ARCHIVED,
                                        excludedId
                                );

        if (exists) {
            throw new ConflictException(
                    GoalMessages.DUPLICATE_NAME
            );
        }
    }

    private SavingsGoal saveGoal(
            SavingsGoal goal
    ) {
        try {
            return savingsGoalRepository
                    .saveAndFlush(goal);
        } catch (
                DataIntegrityViolationException exception
        ) {
            throw new ConflictException(
                    GoalMessages.DUPLICATE_NAME
            );
        }
    }

    private void validateTargetDate(
            LocalDate targetDate
    ) {
        if (
                targetDate.isBefore(
                        LocalDate.now(clock)
                )
        ) {
            throw new BadRequestException(
                    GoalMessages
                            .TARGET_DATE_PAST
            );
        }
    }

    private String normalizeName(
            String value
    ) {
        return value.trim();
    }

    private String normalizeCurrency(
            String value
    ) {
        return value
                .trim()
                .toUpperCase(
                        Locale.ROOT
                );
    }

    private String normalizeIdentifier(
            String value
    ) {
        if (
                value == null
                || value.isBlank()
        ) {
            throw goalNotFound();
        }

        return value.trim();
    }

    private String normalizeOptionalText(
            String value
    ) {
        if (
                value == null
                || value.isBlank()
        ) {
            return null;
        }

        return value.trim();
    }

    private BigDecimal normalizeMoney(
            BigDecimal value
    ) {
        if (value == null) {
            return zeroMoney();
        }

        return value.setScale(
                GoalValidationConstants
                        .MONEY_SCALE,
                RoundingMode.HALF_EVEN
        );
    }

    private BigDecimal zeroMoney() {
        return BigDecimal.ZERO.setScale(
                GoalValidationConstants
                        .MONEY_SCALE,
                RoundingMode.HALF_EVEN
        );
    }

    private ResourceNotFoundException
    goalNotFound() {
        return new ResourceNotFoundException(
                GoalMessages.GOAL_NOT_FOUND
        );
    }

    private static final class
    CurrencyAccumulator {

        private BigDecimal targetAmount =
                BigDecimal.ZERO;

        private BigDecimal savedAmount =
                BigDecimal.ZERO;
    }
}