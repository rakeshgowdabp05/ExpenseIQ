package com.expensetracker.repository;

import com.expensetracker.entity.OAuthLoginCode;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OAuthLoginCodeRepository
        extends JpaRepository<OAuthLoginCode, Long> {

    @EntityGraph(attributePaths = {"user", "user.roles"})
    Optional<OAuthLoginCode> findByCodeHash(String codeHash);
}
