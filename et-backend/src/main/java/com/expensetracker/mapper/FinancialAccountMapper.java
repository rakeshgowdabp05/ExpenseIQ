package com.expensetracker.mapper;

import com.expensetracker.entity.FinancialAccount;
import com.expensetracker.dto.AccountResponse;
import org.springframework.stereotype.Component;

@Component
public class FinancialAccountMapper {

    public AccountResponse toResponse(
            FinancialAccount account
    ) {
        return new AccountResponse(
                account.getPublicId(),
                account.getName(),
                account.getAccountType(),
                account.getCurrencyCode(),
                account.getOpeningBalance(),
                account.getCurrentBalance(),
                account.getInstitutionName(),
                account.getAccountNumberLastFour(),
                account.isIncludeInTotal(),
                account.isActive(),
                account.getCreatedAt(),
                account.getUpdatedAt()
        );
    }
}