package com.expensetracker.dto;

import com.expensetracker.entity.AccountStatus;
import com.expensetracker.entity.Role;
import com.expensetracker.entity.User;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record RegisterResponse(

        String publicId,
        String email,
        String firstName,
        String lastName,
        String phone,
        AccountStatus accountStatus,
        List<String> roles,
        Instant createdAt,
        String registrationRegionCode,
        String registrationRegionLabel,
        BigDecimal registrationLatitude,
        BigDecimal registrationLongitude,
        String registrationTimezone,
        String registrationLocationSource
) {

    public static RegisterResponse from(User user) {
        List<String> roleCodes = user.getRoles()
                .stream()
                .filter(Role::isActive)
                .map(role -> role.getCode().name())
                .sorted()
                .toList();

        return new RegisterResponse(
                user.getPublicId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getAccountStatus(),
                roleCodes,
                user.getCreatedAt(),
                user.getRegistrationRegionCode(),
                user.getRegistrationRegionLabel(),
                user.getRegistrationLatitude(),
                user.getRegistrationLongitude(),
                user.getRegistrationTimezone(),
                user.getRegistrationLocationSource()
        );
    }
}
