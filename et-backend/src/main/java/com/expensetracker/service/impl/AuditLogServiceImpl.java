package com.expensetracker.service.impl;

import com.expensetracker.entity.AuditAction;
import com.expensetracker.entity.AuditLog;
import com.expensetracker.entity.AuditModule;
import com.expensetracker.entity.User;
import com.expensetracker.repository.AuditLogRepository;
import com.expensetracker.service.AuditLogService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditLogServiceImpl
        implements AuditLogService {

    private static final int ENTITY_LABEL_MAX_LENGTH =
            160;

    private static final int DESCRIPTION_MAX_LENGTH =
            255;

    private final AuditLogRepository auditLogRepository;

    public AuditLogServiceImpl(
            AuditLogRepository auditLogRepository
    ) {
        this.auditLogRepository =
                auditLogRepository;
    }

    @Override
    @Transactional
    public void record(
            User user,
            AuditModule module,
            AuditAction action,
            String entityPublicId,
            String entityLabel,
            String description
    ) {
        AuditLog auditLog =
                new AuditLog();

        auditLog.setUser(user);
        auditLog.setModule(module);
        auditLog.setAction(action);
        auditLog.setEntityPublicId(
                normalizeRequired(entityPublicId)
        );
        auditLog.setEntityLabel(
                limit(
                        normalizeOptional(entityLabel),
                        ENTITY_LABEL_MAX_LENGTH
                )
        );
        auditLog.setDescription(
                limit(
                        normalizeRequired(description),
                        DESCRIPTION_MAX_LENGTH
                )
        );

        auditLogRepository.save(auditLog);
    }

    private String normalizeRequired(
            String value
    ) {
        if (
                value == null
                || value.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Audit value is required."
            );
        }

        return value.trim();
    }

    private String normalizeOptional(
            String value
    ) {
        if (
                value == null
                || value.isBlank()
        ) {
            return null;
        }

        return value.trim();
    }

    private String limit(
            String value,
            int maxLength
    ) {
        if (
                value == null
                || value.length() <= maxLength
        ) {
            return value;
        }

        return value.substring(
                0,
                maxLength
        );
    }
}
