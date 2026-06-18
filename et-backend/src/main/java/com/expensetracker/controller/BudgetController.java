package com.expensetracker.controller;

import com.expensetracker.common.BudgetApiPaths;
import com.expensetracker.common.BudgetMessages;
import com.expensetracker.dto.BudgetApiResponse;
import com.expensetracker.dto.BudgetCreateRequest;
import com.expensetracker.dto.BudgetResponse;
import com.expensetracker.dto.BudgetStatusUpdateRequest;
import com.expensetracker.dto.BudgetSummaryResponse;
import com.expensetracker.dto.BudgetUpdateRequest;
import com.expensetracker.service.BudgetService;
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
@RequestMapping(BudgetApiPaths.ROOT)
@Validated
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(
            BudgetService budgetService
    ) {
        this.budgetService = budgetService;
    }

    @PostMapping
    public ResponseEntity<
            BudgetApiResponse<BudgetResponse>
            > create(
                    Authentication authentication,
                    @Valid
                    @RequestBody
                    BudgetCreateRequest request
            ) {

        BudgetResponse response =
                budgetService.create(
                        requireEmail(
                                authentication
                        ),
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        BudgetApiResponse.success(
                                BudgetMessages.CREATED,
                                response
                        )
                );
    }

    @PutMapping(
            BudgetApiPaths.BY_PUBLIC_ID
    )
    public BudgetApiResponse<BudgetResponse>
            update(
                    Authentication authentication,
                    @PathVariable
                    String publicId,
                    @Valid
                    @RequestBody
                    BudgetUpdateRequest request
            ) {

        return BudgetApiResponse.success(
                BudgetMessages.UPDATED,
                budgetService.update(
                        requireEmail(
                                authentication
                        ),
                        publicId,
                        request
                )
        );
    }

    @PatchMapping(
            BudgetApiPaths.STATUS
    )
    public BudgetApiResponse<BudgetResponse>
            updateStatus(
                    Authentication authentication,
                    @PathVariable
                    String publicId,
                    @Valid
                    @RequestBody
                    BudgetStatusUpdateRequest request
            ) {

        return BudgetApiResponse.success(
                BudgetMessages.STATUS_UPDATED,
                budgetService.updateStatus(
                        requireEmail(
                                authentication
                        ),
                        publicId,
                        request
                )
        );
    }

    @GetMapping(
            BudgetApiPaths.BY_PUBLIC_ID
    )
    public BudgetApiResponse<BudgetResponse>
            getByPublicId(
                    Authentication authentication,
                    @PathVariable
                    String publicId
            ) {

        return BudgetApiResponse.success(
                BudgetMessages.FETCHED,
                budgetService.getByPublicId(
                        requireEmail(
                                authentication
                        ),
                        publicId
                )
        );
    }

    @GetMapping
    public BudgetApiResponse<
            List<BudgetResponse>
            > getBudgets(
                    Authentication authentication,
                    @RequestParam(
                            required = false
                    )
                    String month,
                    @RequestParam(
                            required = false
                    )
                    Boolean active
            ) {

        return BudgetApiResponse.success(
                BudgetMessages.LIST_FETCHED,
                budgetService.getBudgets(
                        requireEmail(
                                authentication
                        ),
                        month,
                        active
                )
        );
    }

    @GetMapping(
            BudgetApiPaths.SUMMARY
    )
    public BudgetApiResponse<
            BudgetSummaryResponse
            > getSummary(
                    Authentication authentication,
                    @RequestParam(
                            required = false
                    )
                    String month
            ) {

        return BudgetApiResponse.success(
                BudgetMessages.SUMMARY_FETCHED,
                budgetService.getSummary(
                        requireEmail(
                                authentication
                        ),
                        month
                )
        );
    }

    @DeleteMapping(
            BudgetApiPaths.BY_PUBLIC_ID
    )
    public BudgetApiResponse<Void> archive(
            Authentication authentication,
            @PathVariable
            String publicId
    ) {
        budgetService.archive(
                requireEmail(
                        authentication
                ),
                publicId
        );

        return BudgetApiResponse.success(
                BudgetMessages.ARCHIVED,
                null
        );
    }

    private String requireEmail(
            Authentication authentication
    ) {
        if (
                authentication == null
                || !authentication.isAuthenticated()
                || authentication.getName() == null
                || authentication
                        .getName()
                        .isBlank()
        ) {
            return "";
        }

        return authentication.getName();
    }
}