package com.expensetracker.config;

import com.expensetracker.entity.Role;
import com.expensetracker.entity.User;
import com.expensetracker.entity.AccountStatus;
import com.expensetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ApplicationUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User account was not found."
                ));

        String[] authorities = user.getRoles()
                .stream()
                .filter(Role::isActive)
                .map(role ->
                        SecurityConstants.ROLE_PREFIX
                                + role.getCode().name()
                )
                .toArray(String[]::new);

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .authorities(authorities)
                .disabled(user.getAccountStatus() == AccountStatus.INACTIVE)
                .accountLocked(
                        user.getAccountStatus() == AccountStatus.LOCKED
                )
                .accountExpired(false)
                .credentialsExpired(false)
                .build();
    }
}