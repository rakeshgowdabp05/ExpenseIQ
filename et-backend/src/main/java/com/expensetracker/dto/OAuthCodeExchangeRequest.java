package com.expensetracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record OAuthCodeExchangeRequest(
        @NotBlank(message = "OAuth login code is required.")
        @Size(max = 200, message = "OAuth login code is too long.")
        String code,

        @Size(max = 150, message = "Device name is too long.")
        String deviceName
) {
}
