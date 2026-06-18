package com.expensetracker.repository;

import com.expensetracker.entity.OAuthProvider;
import com.expensetracker.entity.SocialIdentity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SocialIdentityRepository
        extends JpaRepository<SocialIdentity, Long> {

    @EntityGraph(attributePaths = {"user", "user.roles"})
    Optional<SocialIdentity> findByProviderAndProviderSubject(
            OAuthProvider provider,
            String providerSubject
    );

    boolean existsByUser_IdAndProvider(
            Long userId,
            OAuthProvider provider
    );
}
