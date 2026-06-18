package com.expensetracker.service;

public interface LoginFailureService {

    void ensureAccountCanAttemptLogin(
            String normalizedEmail
    );

    void recordFailedLogin(
            String normalizedEmail
    );
}
