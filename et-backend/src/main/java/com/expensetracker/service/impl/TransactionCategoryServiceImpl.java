package com.expensetracker.service.impl;

import com.expensetracker.entity.User;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.entity.TransactionCategory;
import com.expensetracker.entity.CategoryType;
import com.expensetracker.dto.CategoryCreateRequest;
import com.expensetracker.dto.CategoryResponse;
import com.expensetracker.dto.CategoryStatusUpdateRequest;
import com.expensetracker.dto.CategoryUpdateRequest;
import com.expensetracker.mapper.TransactionCategoryMapper;
import com.expensetracker.repository.TransactionCategoryRepository;
import com.expensetracker.service.TransactionCategoryService;
import com.expensetracker.common.ApplicationMessages;
import com.expensetracker.exception.ConflictException;
import com.expensetracker.exception.ForbiddenOperationException;
import com.expensetracker.exception.ResourceNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import com.expensetracker.common.AuditMessages;
import com.expensetracker.entity.AuditAction;
import com.expensetracker.entity.AuditModule;
import com.expensetracker.service.AuditLogService;
@Service
public class TransactionCategoryServiceImpl
        implements TransactionCategoryService {

    private final TransactionCategoryRepository
            transactionCategoryRepository;

    private final UserRepository userRepository;

    private final TransactionCategoryMapper
            transactionCategoryMapper;

    private final AuditLogService auditLogService;

    public TransactionCategoryServiceImpl(
            TransactionCategoryRepository
                    transactionCategoryRepository,
            UserRepository userRepository,
            TransactionCategoryMapper
                    transactionCategoryMapper,
            AuditLogService auditLogService
    ) {
        this.transactionCategoryRepository =
                transactionCategoryRepository;

        this.userRepository = userRepository;

        this.transactionCategoryMapper =
                transactionCategoryMapper;

        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories(
            String authenticatedEmail,
            CategoryType categoryType,
            Boolean active
    ) {
        User user = getAuthenticatedUser(
                authenticatedEmail
        );

        return transactionCategoryRepository
                .findVisibleCategories(
                        user.getId(),
                        categoryType,
                        active
                )
                .stream()
                .map(
                        transactionCategoryMapper
                                ::toResponse
                )
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategory(
            String authenticatedEmail,
            String publicId
    ) {
        User user = getAuthenticatedUser(
                authenticatedEmail
        );

        TransactionCategory category =
                getVisibleCategory(
                        publicId,
                        user.getId()
                );

        return transactionCategoryMapper.toResponse(
                category
        );
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(
            String authenticatedEmail,
            CategoryCreateRequest request
    ) {
        User user = getAuthenticatedUser(
                authenticatedEmail
        );

        String normalizedName =
                normalizeName(request.name());

        if (transactionCategoryRepository
                .existsVisibleByName(
                        user.getId(),
                        request.categoryType(),
                        normalizedName
                )) {

            throw new ConflictException(
                    ApplicationMessages
                            .CATEGORY_NAME_ALREADY_EXISTS
            );
        }

        TransactionCategory category =
                new TransactionCategory();

        category.setUser(user);
        category.setName(normalizedName);
        category.setCategoryType(
                request.categoryType()
        );
        category.setIconKey(
                request.iconKey()
        );
        category.setColorKey(
                request.colorKey()
        );
        category.setSystemDefined(false);
        category.setActive(true);

        TransactionCategory savedCategory =
                saveCategory(category);

        auditLogService.record(
                user,
                AuditModule.TRANSACTION_CATEGORY,
                AuditAction.CREATE,
                savedCategory.getPublicId(),
                savedCategory.getName(),
                AuditMessages.CATEGORY_CREATED
        );

        return transactionCategoryMapper.toResponse(
                savedCategory
        );
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(
            String authenticatedEmail,
            String publicId,
            CategoryUpdateRequest request
    ) {
        User user = getAuthenticatedUser(
                authenticatedEmail
        );

        TransactionCategory category =
                getMutableCategory(
                        publicId,
                        user.getId()
                );

        String normalizedName =
                normalizeName(request.name());

        if (transactionCategoryRepository
                .existsVisibleByNameExcludingId(
                        user.getId(),
                        request.categoryType(),
                        normalizedName,
                        category.getId()
                )) {

            throw new ConflictException(
                    ApplicationMessages
                            .CATEGORY_NAME_ALREADY_EXISTS
            );
        }

        category.setName(normalizedName);
        category.setCategoryType(
                request.categoryType()
        );
        category.setIconKey(
                request.iconKey()
        );
        category.setColorKey(
                request.colorKey()
        );

        TransactionCategory savedCategory =
                saveCategory(category);

        auditLogService.record(
                user,
                AuditModule.TRANSACTION_CATEGORY,
                AuditAction.UPDATE,
                savedCategory.getPublicId(),
                savedCategory.getName(),
                AuditMessages.CATEGORY_UPDATED
        );

        return transactionCategoryMapper.toResponse(
                savedCategory
        );
    }

    @Override
    @Transactional
    public CategoryResponse updateStatus(
            String authenticatedEmail,
            String publicId,
            CategoryStatusUpdateRequest request
    ) {
        User user = getAuthenticatedUser(
                authenticatedEmail
        );

        TransactionCategory category =
                getMutableCategory(
                        publicId,
                        user.getId()
                );

        category.setActive(request.active());

        TransactionCategory savedCategory =
                transactionCategoryRepository.save(
                        category
                );

        auditLogService.record(
                user,
                AuditModule.TRANSACTION_CATEGORY,
                AuditAction.STATUS_CHANGE,
                savedCategory.getPublicId(),
                savedCategory.getName(),
                request.active()
                        ? AuditMessages.CATEGORY_ACTIVATED
                        : AuditMessages.CATEGORY_DEACTIVATED
        );

        return transactionCategoryMapper.toResponse(
                savedCategory
        );
    }

    @Override
    @Transactional
    public void archiveCategory(
            String authenticatedEmail,
            String publicId
    ) {
        User user = getAuthenticatedUser(
                authenticatedEmail
        );

        TransactionCategory category =
                getMutableCategory(
                        publicId,
                        user.getId()
                );

        category.setActive(false);

        TransactionCategory savedCategory =
                transactionCategoryRepository.save(
                        category
                );

        auditLogService.record(
                user,
                AuditModule.TRANSACTION_CATEGORY,
                AuditAction.ARCHIVE,
                savedCategory.getPublicId(),
                savedCategory.getName(),
                AuditMessages.CATEGORY_ARCHIVED
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

    private TransactionCategory getVisibleCategory(
            String publicId,
            Long userId
    ) {
        return transactionCategoryRepository
                .findVisibleByPublicId(
                        publicId,
                        userId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                ApplicationMessages
                                        .TRANSACTION_CATEGORY_NOT_FOUND
                        )
                );
    }

    private TransactionCategory getMutableCategory(
            String publicId,
            Long userId
    ) {
        TransactionCategory category =
                getVisibleCategory(
                        publicId,
                        userId
                );

        if (category.isSystemDefined()) {
            throw new ForbiddenOperationException(
                    ApplicationMessages
                            .SYSTEM_CATEGORY_MODIFICATION_FORBIDDEN
            );
        }

        if (
                category.getUser() == null
                || !category.getUser()
                .getId()
                .equals(userId)
        ) {
            throw new ForbiddenOperationException(
                    ApplicationMessages
                            .CATEGORY_OWNERSHIP_REQUIRED
            );
        }

        return category;
    }

    private TransactionCategory saveCategory(
            TransactionCategory category
    ) {
        try {
            return transactionCategoryRepository
                    .saveAndFlush(category);
        } catch (
                DataIntegrityViolationException exception
        ) {
            throw new ConflictException(
                    ApplicationMessages
                            .CATEGORY_NAME_ALREADY_EXISTS
            );
        }
    }

    private String normalizeName(String name) {
        return name.trim();
    }
}