package com.expensetracker.repository;

import com.expensetracker.entity.ReportExportSettingKey;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ReportExportSettingRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public ReportExportSettingRepository(
            NamedParameterJdbcTemplate jdbcTemplate
    ) {
        this.jdbcTemplate =
                jdbcTemplate;
    }

    public String getRequiredString(
            ReportExportSettingKey settingKey
    ) {
        String value =
                getRequiredValue(settingKey);

        if (value.isBlank()) {
            throw invalidSetting(settingKey);
        }

        return value;
    }

    public int getRequiredPositiveInteger(
            ReportExportSettingKey settingKey
    ) {
        int value =
                Integer.parseInt(
                        getRequiredValue(settingKey)
                );

        if (value <= 0) {
            throw invalidSetting(settingKey);
        }

        return value;
    }

    private String getRequiredValue(
            ReportExportSettingKey settingKey
    ) {
        String sql = """
                SELECT setting_value
                FROM report_export_settings
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
            ReportExportSettingKey settingKey
    ) {
        return new IllegalStateException(
                "Missing report export setting: "
                        + settingKey.databaseKey()
        );
    }

    private IllegalStateException invalidSetting(
            ReportExportSettingKey settingKey
    ) {
        return new IllegalStateException(
                "Invalid report export setting: "
                        + settingKey.databaseKey()
        );
    }
}
