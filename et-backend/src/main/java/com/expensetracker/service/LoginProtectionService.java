package com.expensetracker.service;

public interface LoginProtectionService {

    void recordLoginAttempt(
            String normalizedEmail,
            String ipAddress
    );

    void clearLoginAttempts(
            String normalizedEmail,
            String ipAddress
    );
}
