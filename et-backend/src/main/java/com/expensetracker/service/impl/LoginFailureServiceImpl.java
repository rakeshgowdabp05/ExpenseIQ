package com.expensetracker.service.impl;

import com.expensetracker.common.ApplicationMessages;
import com.expensetracker.config.LoginProtectionProperties;
import com.expensetracker.entity.User;
import com.expensetracker.exception.UnauthorizedException;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.service.LoginFailureService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;

@Service
public class LoginFailureServiceImpl
        implements LoginFailureService {

    private final UserRepository userRepository;

    private final LoginProtectionProperties
            loginProtectionProperties;

    private final Clock clock;

    public LoginFailureServiceImpl(
            UserRepository userRepository,
            LoginProtectionProperties
                    loginProtectionProperties,
            Clock clock
    ) {
        this.userRepository = userRepository;
        this.loginProtectionProperties =
                loginProtectionProperties;
        this.clock = clock;
    }

    @Override
    @Transactional(readOnly = true)
    public void ensureAccountCanAttemptLogin(
            String normalizedEmail
    ) {
        userRepository
                .findByEmailIgnoreCase(
                        normalizedEmail
                )
                .ifPresent(this::ensureNotLocked);
    }

    @Override
    @Transactional(
            propagation = Propagation.REQUIRES_NEW
    )
    public void recordFailedLogin(
            String normalizedEmail
    ) {
        userRepository
                .findByEmailIgnoreCase(
                        normalizedEmail
                )
                .ifPresent(this::incrementFailure);
    }

    private void ensureNotLocked(User user) {
        Instant lockedUntil =
                user.getLockedUntil();

        if (
                lockedUntil != null
                && lockedUntil.isAfter(
                        clock.instant()
                )
        ) {
            throw new UnauthorizedException(
                    ApplicationMessages
                            .ACCOUNT_TEMPORARILY_LOCKED
            );
        }
    }

    private void incrementFailure(User user) {
        int nextFailedAttempts =
                user.getFailedLoginAttempts() + 1;

        user.setFailedLoginAttempts(
                nextFailedAttempts
        );

        if (
                nextFailedAttempts >=
                loginProtectionProperties
                        .getMaxFailedAttempts()
        ) {
            user.setLockedUntil(
                    clock.instant()
                            .plus(
                                    Duration.ofMinutes(
                                            loginProtectionProperties
                                                    .getLockDurationMinutes()
                                    )
                            )
            );
        }

        userRepository.saveAndFlush(user);
    }
}
