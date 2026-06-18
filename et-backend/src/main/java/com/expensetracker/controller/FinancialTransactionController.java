package com.expensetracker.controller;

import com.expensetracker.common.ApiResponse;
import com.expensetracker.common.ApiResponseFactory;
import com.expensetracker.common.ApplicationMessages;
import com.expensetracker.common.TransactionApiPaths;
import com.expensetracker.common.TransactionSuggestionMessages;
import com.expensetracker.common.TransactionValidationConstants;
import com.expensetracker.dto.PagedResponse;
import com.expensetracker.dto.TransactionCreateRequest;
import com.expensetracker.dto.TransactionResponse;
import com.expensetracker.dto.TransactionSuggestionResponse;
import com.expensetracker.dto.TransactionUpdateRequest;
import com.expensetracker.entity.TransactionStatus;
import com.expensetracker.entity.TransactionType;
import com.expensetracker.service.FinancialTransactionService;
import com.expensetracker.service.TransactionSuggestionService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping(TransactionApiPaths.BASE_PATH)
public class FinancialTransactionController {

    private static final String DEFAULT_SUGGESTION_LIMIT =
            "8";

    private final FinancialTransactionService
            financialTransactionService;

    private final TransactionSuggestionService
            transactionSuggestionService;

    private final ApiResponseFactory
            responseFactory;

    public FinancialTransactionController(
            FinancialTransactionService
                    financialTransactionService,
            TransactionSuggestionService
                    transactionSuggestionService,
            ApiResponseFactory responseFactory
    ) {
        this.financialTransactionService =
                financialTransactionService;

        this.transactionSuggestionService =
                transactionSuggestionService;

        this.responseFactory = responseFactory;
    }

    @GetMapping
    public ResponseEntity<
            ApiResponse<
                    PagedResponse<TransactionResponse>
                    >
            > getTransactions(
            Authentication authentication,

            @RequestParam(required = false)
            TransactionType type,

            @RequestParam(required = false)
            TransactionStatus status,

            @RequestParam(required = false)
            String accountPublicId,

            @RequestParam(required = false)
            String categoryPublicId,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fromDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate toDate,

            @RequestParam(required = false)
            String search,

            @RequestParam(
                    defaultValue =
                            TransactionValidationConstants
                                    .DEFAULT_PAGE_NUMBER_VALUE
            )
            int page,

            @RequestParam(
                    defaultValue =
                            TransactionValidationConstants
                                    .DEFAULT_PAGE_SIZE_VALUE
            )
            int size
    ) {
        PagedResponse<TransactionResponse> transactions =
                financialTransactionService
                        .getTransactions(
                                authentication.getName(),
                                type,
                                status,
                                accountPublicId,
                                categoryPublicId,
                                fromDate,
                                toDate,
                                search,
                                page,
                                size
                        );

        return ResponseEntity.ok(
                responseFactory.success(
                        ApplicationMessages
                                .TRANSACTION_LIST_FETCH_SUCCESS,
                        transactions
                )
        );
    }

    @GetMapping(TransactionApiPaths.SUGGESTIONS)
    public ResponseEntity<
            ApiResponse<List<TransactionSuggestionResponse>>
            > getSuggestions(
            Authentication authentication,

            @RequestParam(required = false)
            TransactionType type,

            @RequestParam(required = false)
            String query,

            @RequestParam(defaultValue = DEFAULT_SUGGESTION_LIMIT)
            int limit
    ) {
        List<TransactionSuggestionResponse> suggestions =
                transactionSuggestionService
                        .getSuggestions(
                                authentication.getName(),
                                type,
                                query,
                                limit
                        );

        return ResponseEntity.ok(
                responseFactory.success(
                        TransactionSuggestionMessages.FETCHED,
                        suggestions
                )
        );
    }

    @GetMapping(TransactionApiPaths.BY_PUBLIC_ID)
    public ResponseEntity<
            ApiResponse<TransactionResponse>
            > getTransaction(
            Authentication authentication,

            @PathVariable
            String publicId
    ) {
        TransactionResponse transaction =
                financialTransactionService
                        .getTransaction(
                                authentication.getName(),
                                publicId
                        );

        return ResponseEntity.ok(
                responseFactory.success(
                        ApplicationMessages
                                .TRANSACTION_FETCH_SUCCESS,
                        transaction
                )
        );
    }

    @PostMapping
    public ResponseEntity<
            ApiResponse<TransactionResponse>
            > createTransaction(
            Authentication authentication,

            @Valid
            @RequestBody
            TransactionCreateRequest request
    ) {
        TransactionResponse transaction =
                financialTransactionService
                        .createTransaction(
                                authentication.getName(),
                                request
                        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        responseFactory.success(
                                ApplicationMessages
                                        .TRANSACTION_CREATE_SUCCESS,
                                transaction
                        )
                );
    }

    @PutMapping(TransactionApiPaths.BY_PUBLIC_ID)
    public ResponseEntity<
            ApiResponse<TransactionResponse>
            > updateTransaction(
            Authentication authentication,

            @PathVariable
            String publicId,

            @Valid
            @RequestBody
            TransactionUpdateRequest request
    ) {
        TransactionResponse transaction =
                financialTransactionService
                        .updateTransaction(
                                authentication.getName(),
                                publicId,
                                request
                        );

        return ResponseEntity.ok(
                responseFactory.success(
                        ApplicationMessages
                                .TRANSACTION_UPDATE_SUCCESS,
                        transaction
                )
        );
    }

    @DeleteMapping(TransactionApiPaths.BY_PUBLIC_ID)
    public ResponseEntity<ApiResponse<Void>>
    cancelTransaction(
            Authentication authentication,

            @PathVariable
            String publicId
    ) {
        financialTransactionService
                .cancelTransaction(
                        authentication.getName(),
                        publicId
                );

        return ResponseEntity.ok(
                responseFactory.success(
                        ApplicationMessages
                                .TRANSACTION_CANCEL_SUCCESS,
                        null
                )
        );
    }
}