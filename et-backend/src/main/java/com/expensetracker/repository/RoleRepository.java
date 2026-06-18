package com.expensetracker.repository;

import com.expensetracker.entity.Role;
import com.expensetracker.entity.RoleCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByCode(RoleCode code);

    Optional<Role> findByCodeAndActiveTrue(RoleCode code);

    boolean existsByCode(RoleCode code);
}