package com.expensetracker.dto;

import com.expensetracker.entity.CategoryColorKey;
import com.expensetracker.entity.CategoryIconKey;
import com.expensetracker.entity.CategoryType;

import java.time.Instant;

public record CategoryResponse(

        String publicId,
        String name,
        CategoryType categoryType,
        CategoryIconKey iconKey,
        CategoryColorKey colorKey,
        boolean systemDefined,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
}