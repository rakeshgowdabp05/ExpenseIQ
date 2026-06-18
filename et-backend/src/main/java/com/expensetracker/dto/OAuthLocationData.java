package com.expensetracker.dto;

import java.math.BigDecimal;

public record OAuthLocationData(
        BigDecimal latitude,
        BigDecimal longitude,
        String timezone,
        String source
) {
    public boolean hasCoordinates() {
        return latitude != null && longitude != null;
    }
}
