package com.expensetracker.repository;

import com.expensetracker.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    @EntityGraph(attributePaths = "roles")
    Optional<User> findByEmailIgnoreCase(String email);

    @EntityGraph(attributePaths = "roles")
    Optional<User> findByPublicId(String publicId);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByPublicId(String publicId);
}