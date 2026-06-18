package com.expensetracker.service;

import com.expensetracker.entity.CategoryType;
import com.expensetracker.dto.CategoryCreateRequest;
import com.expensetracker.dto.CategoryResponse;
import com.expensetracker.dto.CategoryStatusUpdateRequest;
import com.expensetracker.dto.CategoryUpdateRequest;

import java.util.List;

public interface TransactionCategoryService {

    List<CategoryResponse> getCategories(
            String authenticatedEmail,
            CategoryType categoryType,
            Boolean active
    );

    CategoryResponse getCategory(
            String authenticatedEmail,
            String publicId
    );

    CategoryResponse createCategory(
            String authenticatedEmail,
            CategoryCreateRequest request
    );

    CategoryResponse updateCategory(
            String authenticatedEmail,
            String publicId,
            CategoryUpdateRequest request
    );

    CategoryResponse updateStatus(
            String authenticatedEmail,
            String publicId,
            CategoryStatusUpdateRequest request
    );

    void archiveCategory(
            String authenticatedEmail,
            String publicId
    );
}