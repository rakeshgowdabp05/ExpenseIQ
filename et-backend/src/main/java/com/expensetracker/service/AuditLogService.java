package com.expensetracker.service;

import com.expensetracker.entity.AuditAction;
import com.expensetracker.entity.AuditModule;
import com.expensetracker.entity.User;

public interface AuditLogService {

    void record(
            User user,
            AuditModule module,
            AuditAction action,
            String entityPublicId,
            String entityLabel,
            String description
    );
}
