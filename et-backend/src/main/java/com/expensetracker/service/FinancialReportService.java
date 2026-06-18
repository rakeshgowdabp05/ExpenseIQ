package com.expensetracker.service;

import com.expensetracker.dto.FinancialReportResponse;
import com.expensetracker.dto.ReportExportFile;

import java.time.LocalDate;

public interface FinancialReportService {

    FinancialReportResponse getReport(
            String authenticatedEmail,
            LocalDate fromDate,
            LocalDate toDate
    );

    ReportExportFile exportCsv(
            String authenticatedEmail,
            LocalDate fromDate,
            LocalDate toDate
    );

    ReportExportFile exportPdf(
            String authenticatedEmail,
            LocalDate fromDate,
            LocalDate toDate
    );

    ReportExportFile exportXlsx(
            String authenticatedEmail,
            LocalDate fromDate,
            LocalDate toDate
    );
}
