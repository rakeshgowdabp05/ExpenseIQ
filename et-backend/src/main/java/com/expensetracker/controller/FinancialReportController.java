package com.expensetracker.controller;

import com.expensetracker.common.ApiResponse;
import com.expensetracker.common.ApiResponseFactory;
import com.expensetracker.common.ReportApiPaths;
import com.expensetracker.common.ReportMessages;
import com.expensetracker.dto.FinancialReportResponse;
import com.expensetracker.dto.ReportExportFile;
import com.expensetracker.service.FinancialReportService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping(ReportApiPaths.BASE_PATH)
public class FinancialReportController {

    private final FinancialReportService reportService;

    private final ApiResponseFactory responseFactory;

    public FinancialReportController(
            FinancialReportService reportService,
            ApiResponseFactory responseFactory
    ) {
        this.reportService =
                reportService;

        this.responseFactory =
                responseFactory;
    }

    @GetMapping(ReportApiPaths.SUMMARY)
    public ResponseEntity<ApiResponse<FinancialReportResponse>>
    getReport(
            Authentication authentication,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fromDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate toDate
    ) {
        return ResponseEntity.ok(
                responseFactory.success(
                        ReportMessages.SUMMARY_FETCHED,
                        reportService.getReport(
                                authentication.getName(),
                                fromDate,
                                toDate
                        )
                )
        );
    }

    @GetMapping(ReportApiPaths.EXPORT_CSV)
    public ResponseEntity<byte[]> exportCsv(
            Authentication authentication,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fromDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate toDate
    ) {
        return exportFile(
                reportService.exportCsv(
                        authentication.getName(),
                        fromDate,
                        toDate
                )
        );
    }

    @GetMapping(ReportApiPaths.EXPORT_PDF)
    public ResponseEntity<byte[]> exportPdf(
            Authentication authentication,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fromDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate toDate
    ) {
        return exportFile(
                reportService.exportPdf(
                        authentication.getName(),
                        fromDate,
                        toDate
                )
        );
    }

    @GetMapping(ReportApiPaths.EXPORT_XLSX)
    public ResponseEntity<byte[]> exportXlsx(
            Authentication authentication,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fromDate,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate toDate
    ) {
        return exportFile(
                reportService.exportXlsx(
                        authentication.getName(),
                        fromDate,
                        toDate
                )
        );
    }

    private ResponseEntity<byte[]> exportFile(
            ReportExportFile exportFile
    ) {
        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition
                                .attachment()
                                .filename(
                                        exportFile.fileName()
                                )
                                .build()
                                .toString()
                )
                .contentType(
                        MediaType.parseMediaType(
                                exportFile.contentType()
                        )
                )
                .body(
                        exportFile.content()
                );
    }
}
