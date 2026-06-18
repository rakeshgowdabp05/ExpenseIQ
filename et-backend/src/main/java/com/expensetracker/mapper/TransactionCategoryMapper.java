package com.expensetracker.mapper;

import com.expensetracker.entity.TransactionCategory;
import com.expensetracker.dto.CategoryResponse;
import org.springframework.stereotype.Component;

@Component
public class TransactionCategoryMapper {

    public CategoryResponse toResponse(
            TransactionCategory category
    ) {
        return new CategoryResponse(
                category.getPublicId(),
                category.getName(),
                category.getCategoryType(),
                category.getIconKey(),
                category.getColorKey(),
                category.isSystemDefined(),
                category.isActive(),
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }
}