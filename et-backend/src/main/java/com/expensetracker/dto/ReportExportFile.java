package com.expensetracker.dto;

public record ReportExportFile(

        String fileName,

        String contentType,

        byte[] content
) {
}
