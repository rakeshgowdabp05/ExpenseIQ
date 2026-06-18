package com.expensetracker.service.impl;

import com.expensetracker.common.ApplicationMessages;
import com.expensetracker.dto.OAuthLocationData;
import com.expensetracker.entity.AccountStatus;
import com.expensetracker.entity.OAuthProvider;
import com.expensetracker.entity.Role;
import com.expensetracker.entity.RoleCode;
import com.expensetracker.entity.SocialIdentity;
import com.expensetracker.entity.User;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.exception.UnauthorizedException;
import com.expensetracker.repository.RoleRepository;
import com.expensetracker.repository.SocialIdentityRepository;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.service.SocialLoginService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.util.Locale;
import java.util.UUID;

@Service
public class SocialLoginServiceImpl
        implements SocialLoginService {

    private final SocialIdentityRepository identityRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final Clock clock;

    public SocialLoginServiceImpl(
            SocialIdentityRepository identityRepository,
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            Clock clock
    ) {
        this.identityRepository = identityRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.clock = clock;
    }

    @Override
    @Transactional
    public User resolveUser(
            OAuthProvider provider,
            OAuth2User principal,
            OAuthLocationData locationData
    ) {
        String subject = firstNonBlank(
                principal.getAttribute("sub"),
                principal.getAttribute("id")
        );

        if (subject == null) {
            throw new UnauthorizedException(
                    ApplicationMessages.OAUTH_PROFILE_INCOMPLETE
            );
        }

        SocialIdentity existingIdentity = identityRepository
                .findByProviderAndProviderSubject(provider, subject)
                .orElse(null);

        if (existingIdentity != null) {
            User user = existingIdentity.getUser();
            updateLoginMetadata(user, locationData);
            return userRepository.save(user);
        }

        String email = normalizeEmail(
                firstNonBlank(
                        principal.getAttribute("email"),
                        principal.getAttribute("emailAddress")
                )
        );

        if (email == null) {
            throw new UnauthorizedException(
                    ApplicationMessages.OAUTH_EMAIL_REQUIRED
            );
        }

        User user = userRepository
                .findByEmailIgnoreCase(email)
                .orElseGet(() -> createUser(principal, email, locationData));

        if (!identityRepository.existsByUser_IdAndProvider(
                user.getId(),
                provider
        )) {
            SocialIdentity identity = new SocialIdentity();
            identity.setUser(user);
            identity.setProvider(provider);
            identity.setProviderSubject(subject);
            identity.setProviderEmail(email);
            identityRepository.save(identity);
        }

        updateLoginMetadata(user, locationData);
        return userRepository.save(user);
    }

    private User createUser(
            OAuth2User principal,
            String email,
            OAuthLocationData locationData
    ) {
        Role defaultRole = roleRepository
                .findByCodeAndActiveTrue(RoleCode.USER)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                ApplicationMessages.DEFAULT_ROLE_NOT_AVAILABLE
                        )
                );

        String fullName = firstNonBlank(
                principal.getAttribute("name"),
                email.substring(0, email.indexOf('@'))
        );

        String firstName = firstNonBlank(
                principal.getAttribute("given_name"),
                principal.getAttribute("first_name"),
                firstNameFrom(fullName)
        );

        String lastName = firstNonBlank(
                principal.getAttribute("family_name"),
                principal.getAttribute("last_name"),
                lastNameFrom(fullName)
        );

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(
                passwordEncoder.encode(UUID.randomUUID().toString())
        );
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setEmailVerified(true);
        user.setFailedLoginAttempts(0);
        user.addRole(defaultRole);
        applyLocationIfAvailable(user, locationData);

        return userRepository.saveAndFlush(user);
    }

    private void updateLoginMetadata(
            User user,
            OAuthLocationData locationData
    ) {
        user.setLastLoginAt(clock.instant());
        user.setFailedLoginAttempts(0);

        if (
                user.getRegistrationLatitude() == null
                        && user.getRegistrationLongitude() == null
        ) {
            applyLocationIfAvailable(user, locationData);
        }
    }

    private void applyLocationIfAvailable(
            User user,
            OAuthLocationData locationData
    ) {
        if (locationData == null || !locationData.hasCoordinates()) {
            return;
        }

        user.setRegistrationLatitude(locationData.latitude());
        user.setRegistrationLongitude(locationData.longitude());
        user.setRegistrationTimezone(
                normalizeOptional(locationData.timezone())
        );
        user.setRegistrationLocationSource(
                normalizeOptional(locationData.source())
        );
        user.setRegistrationLocationCapturedAt(clock.instant());
    }

    private String normalizeEmail(String value) {
        String normalized = normalizeOptional(value);
        return normalized == null
                ? null
                : normalized.toLowerCase(Locale.ROOT);
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

    private String firstNonBlank(Object... values) {
        for (Object value : values) {
            if (value instanceof String text && !text.isBlank()) {
                return text.trim();
            }
        }

        return null;
    }

    private String firstNameFrom(String fullName) {
        String normalized = normalizeOptional(fullName);
        if (normalized == null) {
            return "ExpenseIQ User";
        }

        int separator = normalized.indexOf(' ');
        return separator < 0
                ? normalized
                : normalized.substring(0, separator);
    }

    private String lastNameFrom(String fullName) {
        String normalized = normalizeOptional(fullName);
        if (normalized == null) {
            return null;
        }

        int separator = normalized.indexOf(' ');
        return separator < 0
                ? null
                : normalized.substring(separator + 1).trim();
    }
}
