package com.expensetracker.repository;

import com.expensetracker.dto.NotificationTemplateRecord;
import com.expensetracker.entity.NotificationSeverity;
import com.expensetracker.entity.NotificationType;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class NotificationTemplateRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public NotificationTemplateRepository(
            NamedParameterJdbcTemplate jdbcTemplate
    ) {
        this.jdbcTemplate =
                jdbcTemplate;
    }

    public Optional<NotificationTemplateRecord> findActiveByType(
            NotificationType notificationType
    ) {
        String sql = """
                SELECT
                    code,
                    notification_type,
                    severity,
                    title_template,
                    message_template,
                    source_type,
                    action_url
                FROM notification_templates
                WHERE notification_type = :notificationType
                  AND active = TRUE
                ORDER BY code ASC
                LIMIT 1
                """;

        List<NotificationTemplateRecord> results =
                jdbcTemplate.query(
                        sql,
                        new MapSqlParameterSource()
                                .addValue(
                                        "notificationType",
                                        notificationType.name()
                                ),
                        (resultSet, rowNumber) ->
                                new NotificationTemplateRecord(
                                        resultSet.getString("code"),
                                        NotificationType.valueOf(
                                                resultSet.getString(
                                                        "notification_type"
                                                )
                                        ),
                                        NotificationSeverity.valueOf(
                                                resultSet.getString(
                                                        "severity"
                                                )
                                        ),
                                        resultSet.getString(
                                                "title_template"
                                        ),
                                        resultSet.getString(
                                                "message_template"
                                        ),
                                        resultSet.getString(
                                                "source_type"
                                        ),
                                        resultSet.getString(
                                                "action_url"
                                        )
                                )
                );

        return results.stream().findFirst();
    }
}
