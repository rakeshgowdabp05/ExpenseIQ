package com.expensetracker.controller;

import com.expensetracker.common.CategoryApiPaths;
import com.expensetracker.entity.CategoryType;
import com.expensetracker.dto.CategoryCreateRequest;
import com.expensetracker.dto.CategoryResponse;
import com.expensetracker.dto.CategoryStatusUpdateRequest;
import com.expensetracker.dto.CategoryUpdateRequest;
import com.expensetracker.service.TransactionCategoryService;
import com.expensetracker.common.ApiResponse;
import com.expensetracker.common.ApiResponseFactory;
import com.expensetracker.common.ApplicationMessages;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
@RequestMapping(CategoryApiPaths.BASE_PATH)
public class TransactionCategoryController {

    private final TransactionCategoryService
            transactionCategoryService;

    private final ApiResponseFactory
            responseFactory;

    public TransactionCategoryController(
            TransactionCategoryService
                    transactionCategoryService,
            ApiResponseFactory responseFactory
    ) {
        this.transactionCategoryService =
                transactionCategoryService;

        this.responseFactory = responseFactory;
    }

    @GetMapping
    public ResponseEntity<
            ApiResponse<List<CategoryResponse>>
            > getCategories(
            Authentication authentication,

            @RequestParam(required = false)
            CategoryType type,

            @RequestParam(required = false)
            Boolean active
    ) {
        List<CategoryResponse> categories =
                transactionCategoryService
                        .getCategories(
                                authentication.getName(),
                                type,
                                active
                        );

        return ResponseEntity.ok(
                responseFactory.success(
                        ApplicationMessages
                                .CATEGORY_LIST_FETCH_SUCCESS,
                        categories
                )
        );
    }

    @GetMapping(CategoryApiPaths.BY_PUBLIC_ID)
    public ResponseEntity<
            ApiResponse<CategoryResponse>
            > getCategory(
            Authentication authentication,

            @PathVariable
            String publicId
    ) {
        CategoryResponse category =
                transactionCategoryService
                        .getCategory(
                                authentication.getName(),
                                publicId
                        );

        return ResponseEntity.ok(
                responseFactory.success(
                        ApplicationMessages
                                .CATEGORY_FETCH_SUCCESS,
                        category
                )
        );
    }

    @PostMapping
    public ResponseEntity<
            ApiResponse<CategoryResponse>
            > createCategory(
            Authentication authentication,

            @Valid
            @RequestBody
            CategoryCreateRequest request
    ) {
        CategoryResponse category =
                transactionCategoryService
                        .createCategory(
                                authentication.getName(),
                                request
                        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        responseFactory.success(
                                ApplicationMessages
                                        .CATEGORY_CREATE_SUCCESS,
                                category
                        )
                );
    }

    @PutMapping(CategoryApiPaths.BY_PUBLIC_ID)
    public ResponseEntity<
            ApiResponse<CategoryResponse>
            > updateCategory(
            Authentication authentication,

            @PathVariable
            String publicId,

            @Valid
            @RequestBody
            CategoryUpdateRequest request
    ) {
        CategoryResponse category =
                transactionCategoryService
                        .updateCategory(
                                authentication.getName(),
                                publicId,
                                request
                        );

        return ResponseEntity.ok(
                responseFactory.success(
                        ApplicationMessages
                                .CATEGORY_UPDATE_SUCCESS,
                        category
                )
        );
    }

    @PatchMapping(CategoryApiPaths.STATUS)
    public ResponseEntity<
            ApiResponse<CategoryResponse>
            > updateStatus(
            Authentication authentication,

            @PathVariable
            String publicId,

            @Valid
            @RequestBody
            CategoryStatusUpdateRequest request
    ) {
        CategoryResponse category =
                transactionCategoryService
                        .updateStatus(
                                authentication.getName(),
                                publicId,
                                request
                        );

        return ResponseEntity.ok(
                responseFactory.success(
                        ApplicationMessages
                                .CATEGORY_STATUS_UPDATE_SUCCESS,
                        category
                )
        );
    }

    @DeleteMapping(CategoryApiPaths.BY_PUBLIC_ID)
    public ResponseEntity<ApiResponse<Void>>
    archiveCategory(
            Authentication authentication,

            @PathVariable
            String publicId
    ) {
        transactionCategoryService.archiveCategory(
                authentication.getName(),
                publicId
        );

        return ResponseEntity.ok(
                responseFactory.success(
                        ApplicationMessages
                                .CATEGORY_ARCHIVE_SUCCESS,
                        null
                )
        );
    }
}