package com.expensetracker.service.impl;

import com.expensetracker.common.ApplicationMessages;
import com.expensetracker.common.TransactionValidationConstants;
import com.expensetracker.dto.PagedResponse;
import com.expensetracker.dto.TransactionCreateRequest;
import com.expensetracker.dto.TransactionResponse;
import com.expensetracker.dto.TransactionUpdateRequest;
import com.expensetracker.entity.CategoryType;
import com.expensetracker.entity.FinancialAccount;
import com.expensetracker.entity.FinancialTransaction;
import com.expensetracker.entity.TransactionCategory;
import com.expensetracker.entity.TransactionStatus;
import com.expensetracker.entity.TransactionType;
import com.expensetracker.entity.User;
import com.expensetracker.exception.BadRequestException;
import com.expensetracker.exception.ConflictException;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.mapper.FinancialTransactionMapper;
import com.expensetracker.repository.FinancialAccountRepository;
import com.expensetracker.repository.FinancialTransactionRepository;
import com.expensetracker.repository.FinancialTransactionSpecifications;
import com.expensetracker.repository.TransactionCategoryRepository;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.service.FinancialTransactionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.expensetracker.common.AuditMessages;
import com.expensetracker.entity.AuditAction;
import com.expensetracker.entity.AuditModule;
import com.expensetracker.service.AuditLogService;
@Service
public class FinancialTransactionServiceImpl
        implements FinancialTransactionService {

    private static final Sort TRANSACTION_SORT =
            Sort.by(
                    Sort.Order.desc("transactionDate"),
                    Sort.Order.desc("createdAt")
            );

    private final FinancialTransactionRepository
            financialTransactionRepository;

    private final FinancialAccountRepository
            financialAccountRepository;

    private final TransactionCategoryRepository
            transactionCategoryRepository;

    private final UserRepository userRepository;

    private final FinancialTransactionMapper
            financialTransactionMapper;

    private final AuditLogService auditLogService;

    private final Clock clock;

    public FinancialTransactionServiceImpl(
            FinancialTransactionRepository
                    financialTransactionRepository,
            FinancialAccountRepository
                    financialAccountRepository,
            TransactionCategoryRepository
                    transactionCategoryRepository,
            UserRepository userRepository,
            FinancialTransactionMapper
                    financialTransactionMapper,
            Clock clock,
            AuditLogService auditLogService
    ) {
        this.financialTransactionRepository =
                financialTransactionRepository;

        this.financialAccountRepository =
                financialAccountRepository;

        this.transactionCategoryRepository =
                transactionCategoryRepository;

        this.userRepository = userRepository;

        this.financialTransactionMapper =
                financialTransactionMapper;

        this.clock = clock;

        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<TransactionResponse>
    getTransactions(
            String authenticatedEmail,
            TransactionType transactionType,
            TransactionStatus transactionStatus,
            String accountPublicId,
            String categoryPublicId,
            LocalDate fromDate,
            LocalDate toDate,
            String search,
            int page,
            int size
    ) {
        validatePagination(page, size);
        validateDateRange(fromDate, toDate);

        User user = getAuthenticatedUser(
                authenticatedEmail
        );

        Specification<FinancialTransaction>
                specification =
                FinancialTransactionSpecifications
                        .belongsToUser(user.getId());

        specification = addSpecification(
                specification,
                FinancialTransactionSpecifications
                        .hasType(transactionType)
        );

        specification = addSpecification(
                specification,
                FinancialTransactionSpecifications
                        .hasStatus(transactionStatus)
        );

        specification = addSpecification(
                specification,
                FinancialTransactionSpecifications
                        .involvesAccount(accountPublicId)
        );

        specification = addSpecification(
                specification,
                FinancialTransactionSpecifications
                        .hasCategory(categoryPublicId)
        );

        specification = addSpecification(
                specification,
                FinancialTransactionSpecifications
                        .occurredOnOrAfter(fromDate)
        );

        specification = addSpecification(
                specification,
                FinancialTransactionSpecifications
                        .occurredOnOrBefore(toDate)
        );

        specification = addSpecification(
                specification,
                FinancialTransactionSpecifications
                        .containsSearchText(search)
        );

        Page<FinancialTransaction> transactionPage =
                financialTransactionRepository.findAll(
                        specification,
                        PageRequest.of(
                                page,
                                size,
                                TRANSACTION_SORT
                        )
                );

        Page<TransactionResponse> responsePage =
                transactionPage.map(
                        financialTransactionMapper
                                ::toResponse
                );

        return PagedResponse.from(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getTransaction(
            String authenticatedEmail,
            String publicId
    ) {
        User user = getAuthenticatedUser(
                authenticatedEmail
        );

        FinancialTransaction transaction =
                financialTransactionRepository
                        .findByPublicIdAndUserId(
                                normalizeRequiredIdentifier(
                                        publicId
                                ),
                                user.getId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        ApplicationMessages
                                                .FINANCIAL_TRANSACTION_NOT_FOUND
                                )
                        );

        return financialTransactionMapper.toResponse(
                transaction
        );
    }

    @Override
    @Transactional
    public TransactionResponse createTransaction(
            String authenticatedEmail,
            TransactionCreateRequest request
    ) {
        User user = getAuthenticatedUser(
                authenticatedEmail
        );

        TransactionCommand command =
                TransactionCommand.from(request);

        Map<String, FinancialAccount> lockedAccounts =
                lockOwnedAccounts(
                        user.getId(),
                        collectRequestedAccountIds(
                                command
                        )
                );

        ResolvedTransaction resolved =
                resolveTransaction(
                        user,
                        command,
                        lockedAccounts
                );

        applyBalanceImpact(resolved);

        FinancialTransaction transaction =
                new FinancialTransaction();

        transaction.setUser(user);
        transaction.setTransactionStatus(
                TransactionStatus.POSTED
        );

        applyResolvedData(
                transaction,
                command,
                resolved
        );

        financialAccountRepository.saveAll(
                resolved.affectedAccounts()
        );

        FinancialTransaction savedTransaction =
                financialTransactionRepository
                        .saveAndFlush(transaction);

        auditLogService.record(
                user,
                AuditModule.FINANCIAL_TRANSACTION,
                AuditAction.CREATE,
                savedTransaction.getPublicId(),
                savedTransaction.getTransactionType().name(),
                AuditMessages.TRANSACTION_CREATED
        );

        return financialTransactionMapper.toResponse(
                savedTransaction
        );
    }

    @Override
    @Transactional
    public TransactionResponse updateTransaction(
            String authenticatedEmail,
            String publicId,
            TransactionUpdateRequest request
    ) {
        User user = getAuthenticatedUser(
                authenticatedEmail
        );

        FinancialTransaction transaction =
                getOwnedTransactionForUpdate(
                        publicId,
                        user.getId()
                );

        ensurePosted(transaction);

        TransactionCommand command =
                TransactionCommand.from(request);

        Set<String> accountPublicIds =
                collectRequestedAccountIds(command);

        accountPublicIds.add(
                transaction.getAccount()
                        .getPublicId()
        );

        if (
                transaction.getDestinationAccount()
                        != null
        ) {
            accountPublicIds.add(
                    transaction
                            .getDestinationAccount()
                            .getPublicId()
            );
        }

        Map<String, FinancialAccount> lockedAccounts =
                lockOwnedAccounts(
                        user.getId(),
                        accountPublicIds
                );

        reverseBalanceImpact(
                transaction,
                lockedAccounts
        );

        ResolvedTransaction resolved =
                resolveTransaction(
                        user,
                        command,
                        lockedAccounts
                );

        applyBalanceImpact(resolved);

        applyResolvedData(
                transaction,
                command,
                resolved
        );

        financialAccountRepository.saveAll(
                new ArrayList<>(
                        lockedAccounts.values()
                )
        );

        FinancialTransaction savedTransaction =
                financialTransactionRepository
                        .saveAndFlush(transaction);

        auditLogService.record(
                user,
                AuditModule.FINANCIAL_TRANSACTION,
                AuditAction.UPDATE,
                savedTransaction.getPublicId(),
                savedTransaction.getTransactionType().name(),
                AuditMessages.TRANSACTION_UPDATED
        );

        return financialTransactionMapper.toResponse(
                savedTransaction
        );
    }

    @Override
    @Transactional
    public void cancelTransaction(
            String authenticatedEmail,
            String publicId
    ) {
        User user = getAuthenticatedUser(
                authenticatedEmail
        );

        FinancialTransaction transaction =
                getOwnedTransactionForUpdate(
                        publicId,
                        user.getId()
                );

        ensurePosted(transaction);

        Set<String> accountPublicIds =
                new LinkedHashSet<>();

        accountPublicIds.add(
                transaction.getAccount()
                        .getPublicId()
        );

        if (
                transaction.getDestinationAccount()
                        != null
        ) {
            accountPublicIds.add(
                    transaction
                            .getDestinationAccount()
                            .getPublicId()
            );
        }

        Map<String, FinancialAccount> lockedAccounts =
                lockOwnedAccounts(
                        user.getId(),
                        accountPublicIds
                );

        reverseBalanceImpact(
                transaction,
                lockedAccounts
        );

        transaction.setTransactionStatus(
                TransactionStatus.CANCELLED
        );
        transaction.setCancelledAt(
                clock.instant()
        );

        financialAccountRepository.saveAll(
                lockedAccounts.values()
        );

        financialTransactionRepository.saveAndFlush(
                transaction
        );

        auditLogService.record(
                user,
                AuditModule.FINANCIAL_TRANSACTION,
                AuditAction.CANCEL,
                transaction.getPublicId(),
                transaction.getTransactionType().name(),
                AuditMessages.TRANSACTION_CANCELLED
        );
    }

    private User getAuthenticatedUser(
            String authenticatedEmail
    ) {
        return userRepository
                .findByEmailIgnoreCase(
                        authenticatedEmail
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                ApplicationMessages
                                        .USER_ACCOUNT_NOT_FOUND
                        )
                );
    }

    private FinancialTransaction
    getOwnedTransactionForUpdate(
            String publicId,
            Long userId
    ) {
        return financialTransactionRepository
                .findOwnedByPublicIdForUpdate(
                        normalizeRequiredIdentifier(
                                publicId
                        ),
                        userId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                ApplicationMessages
                                        .FINANCIAL_TRANSACTION_NOT_FOUND
                        )
                );
    }

    private Map<String, FinancialAccount>
    lockOwnedAccounts(
            Long userId,
            Set<String> publicIds
    ) {
        if (publicIds.isEmpty()) {
            throw new BadRequestException(
                    ApplicationMessages
                            .TRANSACTION_ACCOUNT_REQUIRED
            );
        }

        List<FinancialAccount> accounts =
                financialAccountRepository
                        .findOwnedByPublicIdsForUpdate(
                                userId,
                                publicIds
                        );

        if (accounts.size() != publicIds.size()) {
            throw new ResourceNotFoundException(
                    ApplicationMessages
                            .FINANCIAL_ACCOUNT_NOT_FOUND
            );
        }

        Map<String, FinancialAccount> accountsById =
                new LinkedHashMap<>();

        for (FinancialAccount account : accounts) {
            accountsById.put(
                    account.getPublicId(),
                    account
            );
        }

        return accountsById;
    }

    private ResolvedTransaction resolveTransaction(
            User user,
            TransactionCommand command,
            Map<String, FinancialAccount> accounts
    ) {
        FinancialAccount account =
                requireAccount(
                        accounts,
                        command.accountPublicId()
                );

        ensureActive(account);

        BigDecimal amount = normalizeMoney(
                command.amount()
        );

        if (
                command.transactionType()
                        == TransactionType.TRANSFER
        ) {
            return resolveTransfer(
                    command,
                    account,
                    accounts,
                    amount
            );
        }

        return resolveIncomeOrExpense(
                user,
                command,
                account,
                amount
        );
    }

    private ResolvedTransaction resolveTransfer(
            TransactionCommand command,
            FinancialAccount account,
            Map<String, FinancialAccount> accounts,
            BigDecimal amount
    ) {
        String destinationPublicId =
                normalizeOptionalIdentifier(
                        command.destinationAccountPublicId()
                );

        if (destinationPublicId == null) {
            throw new BadRequestException(
                    ApplicationMessages
                            .TRANSFER_DESTINATION_REQUIRED
            );
        }

        if (
                normalizeOptionalIdentifier(
                        command.categoryPublicId()
                ) != null
        ) {
            throw new BadRequestException(
                    ApplicationMessages
                            .TRANSFER_CATEGORY_NOT_ALLOWED
            );
        }

        FinancialAccount destinationAccount =
                requireAccount(
                        accounts,
                        destinationPublicId
                );

        ensureActive(destinationAccount);

        if (
                account.getId().equals(
                        destinationAccount.getId()
                )
        ) {
            throw new BadRequestException(
                    ApplicationMessages
                            .TRANSFER_SAME_ACCOUNT_FORBIDDEN
            );
        }

        if (
                !account.getCurrencyCode().equals(
                        destinationAccount
                                .getCurrencyCode()
                )
        ) {
            throw new BadRequestException(
                    ApplicationMessages
                            .TRANSFER_CURRENCY_MISMATCH
            );
        }

        return new ResolvedTransaction(
                TransactionType.TRANSFER,
                account,
                destinationAccount,
                null,
                amount,
                account.getCurrencyCode()
        );
    }

    private ResolvedTransaction
    resolveIncomeOrExpense(
            User user,
            TransactionCommand command,
            FinancialAccount account,
            BigDecimal amount
    ) {
        if (
                normalizeOptionalIdentifier(
                        command.destinationAccountPublicId()
                ) != null
        ) {
            throw new BadRequestException(
                    ApplicationMessages
                            .NON_TRANSFER_DESTINATION_NOT_ALLOWED
            );
        }

        String categoryPublicId =
                normalizeOptionalIdentifier(
                        command.categoryPublicId()
                );

        if (categoryPublicId == null) {
            throw new BadRequestException(
                    ApplicationMessages
                            .TRANSACTION_CATEGORY_REQUIRED
            );
        }

        TransactionCategory category =
                transactionCategoryRepository
                        .findVisibleByPublicId(
                                categoryPublicId,
                                user.getId()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        ApplicationMessages
                                                .TRANSACTION_CATEGORY_NOT_FOUND
                                )
                        );

        if (!category.isActive()) {
            throw new BadRequestException(
                    ApplicationMessages
                            .TRANSACTION_CATEGORY_INACTIVE
            );
        }

        CategoryType requiredCategoryType =
                command.transactionType()
                        == TransactionType.INCOME
                        ? CategoryType.INCOME
                        : CategoryType.EXPENSE;

        if (
                category.getCategoryType()
                        != requiredCategoryType
        ) {
            throw new BadRequestException(
                    ApplicationMessages
                            .TRANSACTION_CATEGORY_TYPE_MISMATCH
            );
        }

        return new ResolvedTransaction(
                command.transactionType(),
                account,
                null,
                category,
                amount,
                account.getCurrencyCode()
        );
    }

    private void applyResolvedData(
            FinancialTransaction transaction,
            TransactionCommand command,
            ResolvedTransaction resolved
    ) {
        transaction.setTransactionType(
                command.transactionType()
        );
        transaction.setAccount(
                resolved.account()
        );
        transaction.setDestinationAccount(
                resolved.destinationAccount()
        );
        transaction.setCategory(
                resolved.category()
        );
        transaction.setAmount(
                resolved.amount()
        );
        transaction.setCurrencyCode(
                resolved.currencyCode()
        );
        transaction.setTransactionDate(
                command.transactionDate()
        );
        transaction.setMerchantName(
                normalizeOptionalText(
                        command.merchantName()
                )
        );
        transaction.setDescription(
                normalizeOptionalText(
                        command.description()
                )
        );
        transaction.setReferenceNumber(
                normalizeOptionalText(
                        command.referenceNumber()
                )
        );
    }

    private void applyBalanceImpact(
            ResolvedTransaction resolved
    ) {
        switch (resolved.transactionType()) {
            case INCOME -> updateBalance(
                    resolved.account(),
                    resolved.amount()
            );

            case EXPENSE -> updateBalance(
                    resolved.account(),
                    resolved.amount().negate()
            );

            case TRANSFER -> {
                updateBalance(
                        resolved.account(),
                        resolved.amount().negate()
                );

                updateBalance(
                        resolved.destinationAccount(),
                        resolved.amount()
                );
            }
        }
    }

    private void reverseBalanceImpact(
            FinancialTransaction transaction,
            Map<String, FinancialAccount> accounts
    ) {
        FinancialAccount account = requireAccount(
                accounts,
                transaction.getAccount()
                        .getPublicId()
        );

        switch (transaction.getTransactionType()) {
            case INCOME -> updateBalance(
                    account,
                    transaction.getAmount().negate()
            );

            case EXPENSE -> updateBalance(
                    account,
                    transaction.getAmount()
            );

            case TRANSFER -> {
                FinancialAccount destinationAccount =
                        requireAccount(
                                accounts,
                                transaction
                                        .getDestinationAccount()
                                        .getPublicId()
                        );

                updateBalance(
                        account,
                        transaction.getAmount()
                );

                updateBalance(
                        destinationAccount,
                        transaction.getAmount().negate()
                );
            }
        }
    }

    private void updateBalance(
            FinancialAccount account,
            BigDecimal adjustment
    ) {
        account.setCurrentBalance(
                normalizeMoney(
                        account.getCurrentBalance()
                                .add(adjustment)
                )
        );
    }

    private void ensureActive(
            FinancialAccount account
    ) {
        if (!account.isActive()) {
            throw new BadRequestException(
                    ApplicationMessages
                            .TRANSACTION_ACCOUNT_INACTIVE
            );
        }
    }

    private void ensurePosted(
            FinancialTransaction transaction
    ) {
        if (
                transaction.getTransactionStatus()
                        == TransactionStatus.CANCELLED
        ) {
            throw new ConflictException(
                    ApplicationMessages
                            .TRANSACTION_ALREADY_CANCELLED
            );
        }
    }

    private FinancialAccount requireAccount(
            Map<String, FinancialAccount> accounts,
            String publicId
    ) {
        FinancialAccount account = accounts.get(
                normalizeRequiredIdentifier(publicId)
        );

        if (account == null) {
            throw new ResourceNotFoundException(
                    ApplicationMessages
                            .FINANCIAL_ACCOUNT_NOT_FOUND
            );
        }

        return account;
    }

    private Set<String> collectRequestedAccountIds(
            TransactionCommand command
    ) {
        Set<String> accountPublicIds =
                new LinkedHashSet<>();

        accountPublicIds.add(
                normalizeRequiredIdentifier(
                        command.accountPublicId()
                )
        );

        String destinationPublicId =
                normalizeOptionalIdentifier(
                        command.destinationAccountPublicId()
                );

        if (destinationPublicId != null) {
            accountPublicIds.add(
                    destinationPublicId
            );
        }

        return accountPublicIds;
    }

    private void validatePagination(
            int page,
            int size
    ) {
        if (page < 0) {
            throw new BadRequestException(
                    ApplicationMessages
                            .TRANSACTION_PAGE_INVALID
            );
        }

        if (
                size < 1
                || size >
                TransactionValidationConstants
                        .MAX_PAGE_SIZE
        ) {
            throw new BadRequestException(
                    ApplicationMessages
                            .TRANSACTION_PAGE_SIZE_INVALID
            );
        }
    }

    private void validateDateRange(
            LocalDate fromDate,
            LocalDate toDate
    ) {
        if (
                fromDate != null
                && toDate != null
                && fromDate.isAfter(toDate)
        ) {
            throw new BadRequestException(
                    ApplicationMessages
                            .TRANSACTION_DATE_RANGE_INVALID
            );
        }
    }

    private Specification<FinancialTransaction>
    addSpecification(
            Specification<FinancialTransaction> current,
            Specification<FinancialTransaction> addition
    ) {
        if (addition == null) {
            return current;
        }

        return current.and(addition);
    }

    private BigDecimal normalizeMoney(
            BigDecimal value
    ) {
        return value.setScale(
                TransactionValidationConstants.MONEY_SCALE,
                RoundingMode.HALF_EVEN
        );
    }

    private String normalizeRequiredIdentifier(
            String value
    ) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(
                    ApplicationMessages
                            .TRANSACTION_ACCOUNT_REQUIRED
            );
        }

        return value.trim();
    }

    private String normalizeOptionalIdentifier(
            String value
    ) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private String normalizeOptionalText(
            String value
    ) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private record TransactionCommand(
            TransactionType transactionType,
            String accountPublicId,
            String destinationAccountPublicId,
            String categoryPublicId,
            BigDecimal amount,
            LocalDate transactionDate,
            String merchantName,
            String description,
            String referenceNumber
    ) {

        private static TransactionCommand from(
                TransactionCreateRequest request
        ) {
            return new TransactionCommand(
                    request.transactionType(),
                    request.accountPublicId(),
                    request.destinationAccountPublicId(),
                    request.categoryPublicId(),
                    request.amount(),
                    request.transactionDate(),
                    request.merchantName(),
                    request.description(),
                    request.referenceNumber()
            );
        }

        private static TransactionCommand from(
                TransactionUpdateRequest request
        ) {
            return new TransactionCommand(
                    request.transactionType(),
                    request.accountPublicId(),
                    request.destinationAccountPublicId(),
                    request.categoryPublicId(),
                    request.amount(),
                    request.transactionDate(),
                    request.merchantName(),
                    request.description(),
                    request.referenceNumber()
            );
        }
    }

    private record ResolvedTransaction(
            TransactionType transactionType,
            FinancialAccount account,
            FinancialAccount destinationAccount,
            TransactionCategory category,
            BigDecimal amount,
            String currencyCode
    ) {

        private List<FinancialAccount>
        affectedAccounts() {
            if (destinationAccount == null) {
                return List.of(account);
            }

            return List.of(
                    account,
                    destinationAccount
            );
        }
    }
}