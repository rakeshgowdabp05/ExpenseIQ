package com.expensetracker.controller;

import com.expensetracker.common.AccountApiPaths;
import com.expensetracker.dto.AccountCreateRequest;
import com.expensetracker.dto.AccountResponse;
import com.expensetracker.dto.AccountStatusUpdateRequest;
import com.expensetracker.dto.AccountUpdateRequest;
import com.expensetracker.service.FinancialAccountService;
import com.expensetracker.common.ApiResponse;
import com.expensetracker.common.ApiResponseFactory;
import com.expensetracker.common.ApplicationMessages;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping(AccountApiPaths.BASE_PATH)
@Validated
public class FinancialAccountController {

    private final FinancialAccountService
            financialAccountService;

    private final ApiResponseFactory
            responseFactory;

    public FinancialAccountController(
            FinancialAccountService
                    financialAccountService,
            ApiResponseFactory responseFactory
    ) {
        this.financialAccountService =
                financialAccountService;

        this.responseFactory = responseFactory;
    }

    @GetMapping
    public ResponseEntity<
            ApiResponse<List<AccountResponse>>
            > getAccounts(
            Authentication authentication,
            @RequestParam(
                    required = false
            )
            Boolean active
    ) {
        List<AccountResponse> accounts =
                financialAccountService.getAccounts(
                        authentication.getName(),
                        active
                );

        return ResponseEntity.ok(
                responseFactory.success(
                        ApplicationMessages
                                .ACCOUNT_LIST_FETCH_SUCCESS,
                        accounts
                )
        );
    }

    @GetMapping(AccountApiPaths.BY_PUBLIC_ID)
    public ResponseEntity<
            ApiResponse<AccountResponse>
            > getAccount(
            Authentication authentication,
            @PathVariable
            String publicId
    ) {
        AccountResponse account =
                financialAccountService.getAccount(
                        authentication.getName(),
                        publicId
                );

        return ResponseEntity.ok(
                responseFactory.success(
                        ApplicationMessages
                                .ACCOUNT_FETCH_SUCCESS,
                        account
                )
        );
    }

    @PostMapping
    public ResponseEntity<
            ApiResponse<AccountResponse>
            > createAccount(
            Authentication authentication,
            @Valid
            @RequestBody
            AccountCreateRequest request
    ) {
        AccountResponse account =
                financialAccountService.createAccount(
                        authentication.getName(),
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        responseFactory.success(
                                ApplicationMessages
                                        .ACCOUNT_CREATE_SUCCESS,
                                account
                        )
                );
    }

    @PutMapping(AccountApiPaths.BY_PUBLIC_ID)
    public ResponseEntity<
            ApiResponse<AccountResponse>
            > updateAccount(
            Authentication authentication,
            @PathVariable
            String publicId,
            @Valid
            @RequestBody
            AccountUpdateRequest request
    ) {
        AccountResponse account =
                financialAccountService.updateAccount(
                        authentication.getName(),
                        publicId,
                        request
                );

        return ResponseEntity.ok(
                responseFactory.success(
                        ApplicationMessages
                                .ACCOUNT_UPDATE_SUCCESS,
                        account
                )
        );
    }

    @PatchMapping(AccountApiPaths.STATUS)
    public ResponseEntity<
            ApiResponse<AccountResponse>
            > updateStatus(
            Authentication authentication,
            @PathVariable
            String publicId,
            @Valid
            @RequestBody
            AccountStatusUpdateRequest request
    ) {
        AccountResponse account =
                financialAccountService.updateStatus(
                        authentication.getName(),
                        publicId,
                        request
                );

        return ResponseEntity.ok(
                responseFactory.success(
                        ApplicationMessages
                                .ACCOUNT_STATUS_UPDATE_SUCCESS,
                        account
                )
        );
    }

    @DeleteMapping(AccountApiPaths.BY_PUBLIC_ID)
    public ResponseEntity<ApiResponse<Void>>
    archiveAccount(
            Authentication authentication,
            @PathVariable
            String publicId
    ) {
        financialAccountService.archiveAccount(
                authentication.getName(),
                publicId
        );

        return ResponseEntity.ok(
                responseFactory.success(
                        ApplicationMessages
                                .ACCOUNT_ARCHIVE_SUCCESS,
                        null
                )
        );
    }
}