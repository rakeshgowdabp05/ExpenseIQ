package com.expensetracker.service.impl;

import com.expensetracker.common.ApplicationMessages;
import com.expensetracker.common.AuditMessages;
import com.expensetracker.dto.AccountCreateRequest;
import com.expensetracker.dto.AccountResponse;
import com.expensetracker.dto.AccountStatusUpdateRequest;
import com.expensetracker.dto.AccountUpdateRequest;
import com.expensetracker.entity.AuditAction;
import com.expensetracker.entity.AuditModule;
import com.expensetracker.entity.FinancialAccount;
import com.expensetracker.entity.User;
import com.expensetracker.exception.ConflictException;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.mapper.FinancialAccountMapper;
import com.expensetracker.repository.FinancialAccountRepository;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.service.AuditLogService;
import com.expensetracker.service.FinancialAccountService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Locale;

@Service
public class FinancialAccountServiceImpl
        implements FinancialAccountService {

    private static final int MONEY_SCALE = 2;

    private final FinancialAccountRepository
            financialAccountRepository;

    private final UserRepository userRepository;

    private final FinancialAccountMapper
            financialAccountMapper;

    private final AuditLogService auditLogService;

    public FinancialAccountServiceImpl(
            FinancialAccountRepository
                    financialAccountRepository,
            UserRepository userRepository,
            FinancialAccountMapper financialAccountMapper,
            AuditLogService auditLogService
    ) {
        this.financialAccountRepository =
                financialAccountRepository;

        this.userRepository = userRepository;

        this.financialAccountMapper =
                financialAccountMapper;

        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AccountResponse> getAccounts(
            String authenticatedEmail,
            Boolean active
    ) {
        User user = getAuthenticatedUser(
                authenticatedEmail
        );

        List<FinancialAccount> accounts;

        if (active == null) {
            accounts =
                    financialAccountRepository
                            .findAllByUserIdOrderByCreatedAtDesc(
                                    user.getId()
                            );
        } else {
            accounts =
                    financialAccountRepository
                            .findAllByUserIdAndActiveOrderByCreatedAtDesc(
                                    user.getId(),
                                    active
                            );
        }

        return accounts
                .stream()
                .map(financialAccountMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AccountResponse getAccount(
            String authenticatedEmail,
            String publicId
    ) {
        User user = getAuthenticatedUser(
                authenticatedEmail
        );

        FinancialAccount account =
                getOwnedAccount(
                        publicId,
                        user.getId()
                );

        return financialAccountMapper.toResponse(
                account
        );
    }

    @Override
    @Transactional
    public AccountResponse createAccount(
            String authenticatedEmail,
            AccountCreateRequest request
    ) {
        User user = getAuthenticatedUser(
                authenticatedEmail
        );

        String normalizedName =
                normalizeRequiredText(
                        request.name()
                );

        if (financialAccountRepository
                .existsByUserIdAndNameIgnoreCase(
                        user.getId(),
                        normalizedName
                )) {

            throw new ConflictException(
                    ApplicationMessages
                            .ACCOUNT_NAME_ALREADY_EXISTS
            );
        }

        BigDecimal openingBalance =
                normalizeMoney(
                        request.openingBalance()
                );

        FinancialAccount account =
                new FinancialAccount();

        account.setUser(user);
        account.setName(normalizedName);
        account.setAccountType(
                request.accountType()
        );
        account.setCurrencyCode(
                normalizeCurrencyCode(
                        request.currencyCode()
                )
        );
        account.setOpeningBalance(openingBalance);
        account.setCurrentBalance(openingBalance);
        account.setInstitutionName(
                normalizeOptionalText(
                        request.institutionName()
                )
        );
        account.setAccountNumberLastFour(
                normalizeOptionalText(
                        request.accountNumberLastFour()
                )
        );
        account.setIncludeInTotal(
                request.includeInTotal()
        );
        account.setActive(true);

        FinancialAccount savedAccount =
                saveAccount(account);

        auditLogService.record(
                user,
                AuditModule.FINANCIAL_ACCOUNT,
                AuditAction.CREATE,
                savedAccount.getPublicId(),
                savedAccount.getName(),
                AuditMessages.ACCOUNT_CREATED
        );

        return financialAccountMapper.toResponse(
                savedAccount
        );
    }

    @Override
    @Transactional
    public AccountResponse updateAccount(
            String authenticatedEmail,
            String publicId,
            AccountUpdateRequest request
    ) {
        User user = getAuthenticatedUser(
                authenticatedEmail
        );

        FinancialAccount account =
                getOwnedAccount(
                        publicId,
                        user.getId()
                );

        String normalizedName =
                normalizeRequiredText(
                        request.name()
                );

        if (financialAccountRepository
                .existsByUserIdAndNameIgnoreCaseAndIdNot(
                        user.getId(),
                        normalizedName,
                        account.getId()
                )) {

            throw new ConflictException(
                    ApplicationMessages
                            .ACCOUNT_NAME_ALREADY_EXISTS
            );
        }

        account.setName(normalizedName);
        account.setAccountType(
                request.accountType()
        );
        account.setInstitutionName(
                normalizeOptionalText(
                        request.institutionName()
                )
        );
        account.setAccountNumberLastFour(
                normalizeOptionalText(
                        request.accountNumberLastFour()
                )
        );
        account.setIncludeInTotal(
                request.includeInTotal()
        );

        FinancialAccount savedAccount =
                saveAccount(account);

        auditLogService.record(
                user,
                AuditModule.FINANCIAL_ACCOUNT,
                AuditAction.UPDATE,
                savedAccount.getPublicId(),
                savedAccount.getName(),
                AuditMessages.ACCOUNT_UPDATED
        );

        return financialAccountMapper.toResponse(
                savedAccount
        );
    }

    @Override
    @Transactional
    public AccountResponse updateStatus(
            String authenticatedEmail,
            String publicId,
            AccountStatusUpdateRequest request
    ) {
        User user = getAuthenticatedUser(
                authenticatedEmail
        );

        FinancialAccount account =
                getOwnedAccount(
                        publicId,
                        user.getId()
                );

        account.setActive(request.active());

        FinancialAccount savedAccount =
                financialAccountRepository.save(
                        account
                );

        auditLogService.record(
                user,
                AuditModule.FINANCIAL_ACCOUNT,
                AuditAction.STATUS_CHANGE,
                savedAccount.getPublicId(),
                savedAccount.getName(),
                request.active()
                        ? AuditMessages.ACCOUNT_ACTIVATED
                        : AuditMessages.ACCOUNT_DEACTIVATED
        );

        return financialAccountMapper.toResponse(
                savedAccount
        );
    }

    @Override
    @Transactional
    public void archiveAccount(
            String authenticatedEmail,
            String publicId
    ) {
        User user = getAuthenticatedUser(
                authenticatedEmail
        );

        FinancialAccount account =
                getOwnedAccount(
                        publicId,
                        user.getId()
                );

        account.setActive(false);
        account.setIncludeInTotal(false);

        FinancialAccount savedAccount =
                financialAccountRepository.save(
                        account
                );

        auditLogService.record(
                user,
                AuditModule.FINANCIAL_ACCOUNT,
                AuditAction.ARCHIVE,
                savedAccount.getPublicId(),
                savedAccount.getName(),
                AuditMessages.ACCOUNT_ARCHIVED
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

    private FinancialAccount getOwnedAccount(
            String publicId,
            Long userId
    ) {
        return financialAccountRepository
                .findByPublicIdAndUserId(
                        publicId,
                        userId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                ApplicationMessages
                                        .FINANCIAL_ACCOUNT_NOT_FOUND
                        )
                );
    }

    private FinancialAccount saveAccount(
            FinancialAccount account
    ) {
        try {
            return financialAccountRepository
                    .saveAndFlush(account);
        } catch (
                DataIntegrityViolationException exception
        ) {
            throw new ConflictException(
                    ApplicationMessages
                            .ACCOUNT_NAME_ALREADY_EXISTS
            );
        }
    }

    private String normalizeRequiredText(
            String value
    ) {
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

    private String normalizeCurrencyCode(
            String currencyCode
    ) {
        return currencyCode
                .trim()
                .toUpperCase(Locale.ROOT);
    }

    private BigDecimal normalizeMoney(
            BigDecimal value
    ) {
        return value.setScale(
                MONEY_SCALE,
                RoundingMode.HALF_EVEN
        );
    }
}