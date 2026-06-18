package com.expensetracker.repository;

import com.expensetracker.entity.NotificationAlertSettingKey;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public class NotificationAlertSettingRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public NotificationAlertSettingRepository(
            NamedParameterJdbcTemplate jdbcTemplate
    ) {
        this.jdbcTemplate =
                jdbcTemplate;
    }

    public int getRequiredPositiveInteger(
            NotificationAlertSettingKey settingKey
    ) {
        String value =
                getRequiredValue(settingKey);

        int resolvedValue =
                Integer.parseInt(value);

        if (resolvedValue <= 0) {
            throw invalidSetting(settingKey);
        }

        return resolvedValue;
    }

    public BigDecimal getRequiredPositiveDecimal(
            NotificationAlertSettingKey settingKey
    ) {
        BigDecimal resolvedValue =
                new BigDecimal(
                        getRequiredValue(settingKey)
                );

        if (
                resolvedValue.compareTo(
                        BigDecimal.ZERO
                ) <= 0
        ) {
            throw invalidSetting(settingKey);
        }

        return resolvedValue;
    }

    private String getRequiredValue(
            NotificationAlertSettingKey settingKey
    ) {
        String sql = """
                SELECT setting_value
                FROM notification_alert_settings
                WHERE setting_key = :settingKey
                  AND active = TRUE
                LIMIT 1
                """;

        List<String> results =
                jdbcTemplate.query(
                        sql,
                        new MapSqlParameterSource()
                                .addValue(
                                        "settingKey",
                                        settingKey.databaseKey()
                                ),
                        (resultSet, rowNumber) ->
                                resultSet.getString(
                                        "setting_value"
                                )
                );

        return results.stream()
                .findFirst()
                .orElseThrow(
                        () -> missingSetting(settingKey)
                );
    }

    private IllegalStateException missingSetting(
            NotificationAlertSettingKey settingKey
    ) {
        return new IllegalStateException(
                "Missing notification alert setting: "
                        + settingKey.databaseKey()
        );
    }

    private IllegalStateException invalidSetting(
            NotificationAlertSettingKey settingKey
    ) {
        return new IllegalStateException(
                "Invalid notification alert setting: "
                        + settingKey.databaseKey()
        );
    }
}
