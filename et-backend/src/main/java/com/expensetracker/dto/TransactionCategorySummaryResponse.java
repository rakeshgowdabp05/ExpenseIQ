package com.expensetracker.dto;

import com.expensetracker.entity.CategoryColorKey;
import com.expensetracker.entity.CategoryIconKey;
import com.expensetracker.entity.CategoryType;

public record TransactionCategorySummaryResponse(

        String publicId,
        String name,
        CategoryType categoryType,
        CategoryIconKey iconKey,
        CategoryColorKey colorKey,
        boolean systemDefined
) {
}