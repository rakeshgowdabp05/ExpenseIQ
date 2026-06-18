package com.expensetracker.service.impl;

import com.expensetracker.dto.FinancialReportResponse;
import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

final class ReportPdfWriter {

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy");

    private ReportPdfWriter() {
    }

    static byte[] write(
            FinancialReportResponse report,
            String brandName,
            String watermarkText,
            int rowLimit
    ) {
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder =
                    new PdfRendererBuilder();

            builder.useFastMode();
            builder.withHtmlContent(
                    renderHtml(
                            report,
                            brandName,
                            watermarkText,
                            rowLimit
                    ),
                    null
            );
            builder.toStream(output);
            builder.run();

            return output.toByteArray();
        } catch (Exception exception) {
            throw new IllegalStateException(
                    "Unable to render financial report PDF.",
                    exception
            );
        }
    }

    private static String renderHtml(
            FinancialReportResponse report,
            String brandName,
            String watermarkText,
            int rowLimit
    ) {
        StringBuilder html =
                new StringBuilder();

        html.append("""
                <html xmlns="http://www.w3.org/1999/xhtml">
                <head>
                  <meta charset="UTF-8" />
                  <style>
                    @page {
                      size: A4;
                      margin: 28px 32px 32px 32px;
                    }

                    * {
                      box-sizing: border-box;
                    }

                    body {
                      margin: 0;
                      font-family: Arial, Helvetica, sans-serif;
                      color: #111827;
                      background: #ffffff;
                      font-size: 12px;
                      line-height: 1.45;
                    }

                    .watermark {
                      position: fixed;
                      top: 390px;
                      left: 0;
                      right: 0;
                      text-align: center;
                      font-size: 46px;
                      font-weight: 700;
                      color: #f1f5f9;
                      z-index: -1;
                    }

                    .top-accent {
                      height: 4px;
                      background: #2457d6;
                      margin-bottom: 24px;
                    }

                    .header {
                      width: 100%;
                      border-bottom: 1px solid #e5e7eb;
                      padding-bottom: 18px;
                      margin-bottom: 22px;
                    }

                    .header-table {
                      width: 100%;
                      border-collapse: collapse;
                    }

                    .brand {
                      font-size: 11px;
                      font-weight: 800;
                      letter-spacing: 0.11em;
                      color: #2457d6;
                      text-transform: uppercase;
                      margin-bottom: 8px;
                    }

                    .title {
                      margin: 0;
                      font-size: 30px;
                      line-height: 1.05;
                      font-weight: 800;
                      color: #0f172a;
                    }

                    .subtitle {
                      margin-top: 9px;
                      color: #64748b;
                      font-size: 11px;
                    }

                    .meta {
                      width: 210px;
                      margin-left: auto;
                      border: 1px solid #e5e7eb;
                      border-radius: 12px;
                      padding: 12px 14px;
                      background: #f8fafc;
                    }

                    .meta-label {
                      font-size: 8.5px;
                      color: #64748b;
                      font-weight: 800;
                      letter-spacing: 0.08em;
                      text-transform: uppercase;
                      margin-bottom: 4px;
                    }

                    .meta-value {
                      color: #0f172a;
                      font-size: 10.5px;
                      font-weight: 700;
                      margin-bottom: 10px;
                    }

                    .meta-value.last {
                      margin-bottom: 0;
                    }

                    .snapshot {
                      border: 1px solid #e5e7eb;
                      border-radius: 14px;
                      background: #ffffff;
                      padding: 13px 14px;
                      margin-bottom: 18px;
                    }

                    .snapshot-title {
                      font-size: 13px;
                      font-weight: 800;
                      color: #0f172a;
                      margin: 0 0 4px 0;
                    }

                    .snapshot-subtitle {
                      color: #64748b;
                      font-size: 10.5px;
                      margin: 0;
                    }

                    .metrics {
                      width: 100%;
                      border-collapse: separate;
                      border-spacing: 8px 0;
                      margin-left: -8px;
                      margin-right: -8px;
                      margin-bottom: 22px;
                    }

                    .metric-card {
                      width: 25%;
                      border: 1px solid #e5e7eb;
                      border-radius: 14px;
                      padding: 12px;
                      background: #f8fafc;
                    }

                    .metric-label {
                      color: #64748b;
                      font-size: 9.5px;
                      font-weight: 800;
                      margin-bottom: 8px;
                    }

                    .metric-value {
                      color: #0f172a;
                      font-size: 16px;
                      font-weight: 800;
                      line-height: 1.15;
                      margin-bottom: 7px;
                    }

                    .metric-note {
                      color: #94a3b8;
                      font-size: 9px;
                    }

                    .income {
                      border-top: 3px solid #10b981;
                    }

                    .expense {
                      border-top: 3px solid #ef4444;
                    }

                    .net {
                      border-top: 3px solid #2457d6;
                    }

                    .records {
                      border-top: 3px solid #64748b;
                    }

                    .section {
                      margin-top: 20px;
                      page-break-inside: avoid;
                    }

                    .section-title {
                      font-size: 15px;
                      color: #0f172a;
                      font-weight: 800;
                      margin: 0;
                    }

                    .section-text {
                      color: #64748b;
                      font-size: 10.5px;
                      margin: 4px 0 10px 0;
                    }

                    table.report-table {
                      width: 100%;
                      border-collapse: collapse;
                      border: 1px solid #e5e7eb;
                    }

                    .report-table th {
                      background: #f1f5f9;
                      color: #475569;
                      font-size: 9px;
                      font-weight: 800;
                      text-transform: uppercase;
                      letter-spacing: 0.05em;
                      text-align: left;
                      padding: 8px 9px;
                      border-bottom: 1px solid #e5e7eb;
                    }

                    .report-table td {
                      padding: 8px 9px;
                      border-bottom: 1px solid #edf2f7;
                      color: #111827;
                      font-size: 10px;
                      vertical-align: top;
                    }

                    .report-table tr:last-child td {
                      border-bottom: none;
                    }

                    .amount {
                      font-weight: 700;
                      white-space: nowrap;
                    }

                    .status {
                      display: inline-block;
                      padding: 3px 8px;
                      border-radius: 999px;
                      background: #eef2ff;
                      color: #2457d6;
                      font-size: 8.5px;
                      font-weight: 800;
                    }

                    .empty {
                      padding: 13px;
                      border: 1px dashed #cbd5e1;
                      border-radius: 12px;
                      background: #f8fafc;
                      color: #64748b;
                      font-size: 10.5px;
                    }

                    .footer {
                      margin-top: 24px;
                      padding-top: 12px;
                      border-top: 1px solid #e5e7eb;
                      color: #94a3b8;
                      font-size: 9px;
                    }

                    .footer-table {
                      width: 100%;
                      border-collapse: collapse;
                    }

                    .right {
                      text-align: right;
                    }
                  </style>
                </head>
                <body>
                """);

        html.append("<div class=\"watermark\">")
                .append(escapeHtml(watermarkText))
                .append("</div>");

        html.append("<div class=\"top-accent\"></div>");

        appendHeader(
                html,
                report,
                brandName
        );

        if (report.currencies().isEmpty()) {
            html.append("<div class=\"empty\">No report data is available for the selected period.</div>");
            appendFooter(
                    html,
                    brandName
            );
            html.append("</body></html>");
            return html.toString();
        }

        for (FinancialReportResponse.CurrencyReport currencyReport
                : report.currencies()) {
            appendCurrencyReport(
                    html,
                    currencyReport,
                    rowLimit
            );
        }

        appendFooter(
                html,
                brandName
        );

        html.append("</body></html>");

        return html.toString();
    }

    private static void appendHeader(
            StringBuilder html,
            FinancialReportResponse report,
            String brandName
    ) {
        html.append("<div class=\"header\">")
                .append("<table class=\"header-table\"><tr>")
                .append("<td>")
                .append("<div class=\"brand\">")
                .append(escapeHtml(brandName))
                .append("</div>")
                .append("<h1 class=\"title\">Financial Report</h1>")
                .append("<div class=\"subtitle\">Expense-management report generated from real posted financial records.</div>")
                .append("</td>")
                .append("<td>")
                .append("<div class=\"meta\">")
                .append("<div class=\"meta-label\">Report period</div>")
                .append("<div class=\"meta-value\">")
                .append(formatDate(report.fromDate()))
                .append(" to ")
                .append(formatDate(report.toDate()))
                .append("</div>")
                .append("<div class=\"meta-label\">Generated</div>")
                .append("<div class=\"meta-value last\">")
                .append(escapeHtml(compactInstant(report.generatedAt())))
                .append("</div>")
                .append("</div>")
                .append("</td>")
                .append("</tr></table>")
                .append("</div>");
    }

    private static void appendCurrencyReport(
            StringBuilder html,
            FinancialReportResponse.CurrencyReport currencyReport,
            int rowLimit
    ) {
        FinancialReportResponse.ReportTotals totals =
                currencyReport.totals();

        html.append("<div class=\"snapshot\">")
                .append("<p class=\"snapshot-title\">Report Snapshot</p>")
                .append("<p class=\"snapshot-subtitle\">Currency: ")
                .append(escapeHtml(currencyReport.currencyCode()))
                .append(" &#160; | &#160; Categories: ")
                .append(currencyReport.categoryExpenses().size())
                .append(" &#160; | &#160; Budgets: ")
                .append(currencyReport.budgets().size())
                .append(" &#160; | &#160; Goals: ")
                .append(currencyReport.goals().size())
                .append("</p>")
                .append("</div>");

        html.append("<table class=\"metrics\"><tr>");

        appendMetric(
                html,
                "income",
                "Income",
                money(
                        totals.income(),
                        currencyReport.currencyCode()
                ),
                "Posted income"
        );

        appendMetric(
                html,
                "expense",
                "Expenses",
                money(
                        totals.expense(),
                        currencyReport.currencyCode()
                ),
                "Posted expenses"
        );

        appendMetric(
                html,
                "net",
                "Net Cash Flow",
                money(
                        totals.netCashFlow(),
                        currencyReport.currencyCode()
                ),
                "Income minus expenses"
        );

        appendMetric(
                html,
                "records",
                "Transactions",
                String.valueOf(totals.transactionCount()),
                "Posted records"
        );

        html.append("</tr></table>");

        appendCategorySection(
                html,
                currencyReport,
                Math.min(rowLimit, 8)
        );

        appendBudgetSection(
                html,
                currencyReport,
                Math.min(rowLimit, 8)
        );

        appendGoalSection(
                html,
                currencyReport,
                Math.min(rowLimit, 8)
        );
    }

    private static void appendMetric(
            StringBuilder html,
            String className,
            String label,
            String value,
            String note
    ) {
        html.append("<td class=\"metric-card ")
                .append(className)
                .append("\">")
                .append("<div class=\"metric-label\">")
                .append(escapeHtml(label))
                .append("</div>")
                .append("<div class=\"metric-value\">")
                .append(escapeHtml(value))
                .append("</div>")
                .append("<div class=\"metric-note\">")
                .append(escapeHtml(note))
                .append("</div>")
                .append("</td>");
    }

    private static void appendCategorySection(
            StringBuilder html,
            FinancialReportResponse.CurrencyReport currencyReport,
            int limit
    ) {
        appendSectionHeader(
                html,
                "Category Expense Report",
                "Expense categories ranked by posted spending."
        );

        if (currencyReport.categoryExpenses().isEmpty()) {
            appendEmpty(html);
            return;
        }

        html.append("<table class=\"report-table\">")
                .append("<thead><tr>")
                .append("<th>Category</th>")
                .append("<th>Amount</th>")
                .append("<th>Transactions</th>")
                .append("<th>Share</th>")
                .append("</tr></thead><tbody>");

        currencyReport.categoryExpenses()
                .stream()
                .limit(limit)
                .forEach(row ->
                        html.append("<tr>")
                                .append("<td>")
                                .append(escapeHtml(row.categoryName()))
                                .append("</td>")
                                .append("<td class=\"amount\">")
                                .append(escapeHtml(money(
                                        row.amount(),
                                        currencyReport.currencyCode()
                                )))
                                .append("</td>")
                                .append("<td>")
                                .append(row.transactionCount())
                                .append("</td>")
                                .append("<td>")
                                .append(row.percentageOfExpense())
                                .append("%</td>")
                                .append("</tr>")
                );

        html.append("</tbody></table></div>");
    }

    private static void appendBudgetSection(
            StringBuilder html,
            FinancialReportResponse.CurrencyReport currencyReport,
            int limit
    ) {
        appendSectionHeader(
                html,
                "Budget Performance",
                "Budget limits compared with actual spending."
        );

        if (currencyReport.budgets().isEmpty()) {
            appendEmpty(html);
            return;
        }

        html.append("<table class=\"report-table\">")
                .append("<thead><tr>")
                .append("<th>Budget</th>")
                .append("<th>Limit</th>")
                .append("<th>Spent</th>")
                .append("<th>Remaining</th>")
                .append("<th>Status</th>")
                .append("</tr></thead><tbody>");

        currencyReport.budgets()
                .stream()
                .limit(limit)
                .forEach(row ->
                        html.append("<tr>")
                                .append("<td>")
                                .append(escapeHtml(row.budgetName()))
                                .append("</td>")
                                .append("<td class=\"amount\">")
                                .append(escapeHtml(money(
                                        row.limitAmount(),
                                        currencyReport.currencyCode()
                                )))
                                .append("</td>")
                                .append("<td class=\"amount\">")
                                .append(escapeHtml(money(
                                        row.spentAmount(),
                                        currencyReport.currencyCode()
                                )))
                                .append("</td>")
                                .append("<td class=\"amount\">")
                                .append(escapeHtml(money(
                                        row.remainingAmount(),
                                        currencyReport.currencyCode()
                                )))
                                .append("</td>")
                                .append("<td><span class=\"status\">")
                                .append(escapeHtml(row.status()))
                                .append("</span></td>")
                                .append("</tr>")
                );

        html.append("</tbody></table></div>");
    }

    private static void appendGoalSection(
            StringBuilder html,
            FinancialReportResponse.CurrencyReport currencyReport,
            int limit
    ) {
        appendSectionHeader(
                html,
                "Savings Goal Progress",
                "Current progress against target savings goals."
        );

        if (currencyReport.goals().isEmpty()) {
            appendEmpty(html);
            return;
        }

        html.append("<table class=\"report-table\">")
                .append("<thead><tr>")
                .append("<th>Goal</th>")
                .append("<th>Current</th>")
                .append("<th>Target</th>")
                .append("<th>Remaining</th>")
                .append("<th>Progress</th>")
                .append("</tr></thead><tbody>");

        currencyReport.goals()
                .stream()
                .limit(limit)
                .forEach(row ->
                        html.append("<tr>")
                                .append("<td>")
                                .append(escapeHtml(row.goalName()))
                                .append("</td>")
                                .append("<td class=\"amount\">")
                                .append(escapeHtml(money(
                                        row.currentAmount(),
                                        currencyReport.currencyCode()
                                )))
                                .append("</td>")
                                .append("<td class=\"amount\">")
                                .append(escapeHtml(money(
                                        row.targetAmount(),
                                        currencyReport.currencyCode()
                                )))
                                .append("</td>")
                                .append("<td class=\"amount\">")
                                .append(escapeHtml(money(
                                        row.remainingAmount(),
                                        currencyReport.currencyCode()
                                )))
                                .append("</td>")
                                .append("<td>")
                                .append(row.progressPercentage())
                                .append("%</td>")
                                .append("</tr>")
                );

        html.append("</tbody></table></div>");
    }

    private static void appendSectionHeader(
            StringBuilder html,
            String title,
            String subtitle
    ) {
        html.append("<div class=\"section\">")
                .append("<h2 class=\"section-title\">")
                .append(escapeHtml(title))
                .append("</h2>")
                .append("<p class=\"section-text\">")
                .append(escapeHtml(subtitle))
                .append("</p>");
    }

    private static void appendEmpty(
            StringBuilder html
    ) {
        html.append("<div class=\"empty\">No rows are available for this section.</div>")
                .append("</div>");
    }

    private static void appendFooter(
            StringBuilder html,
            String brandName
    ) {
        html.append("<div class=\"footer\">")
                .append("<table class=\"footer-table\"><tr>")
                .append("<td>Generated by ")
                .append(escapeHtml(brandName))
                .append("</td>")
                .append("<td class=\"right\">Confidential financial report</td>")
                .append("</tr></table>")
                .append("</div>");
    }

    private static String formatDate(
            LocalDate date
    ) {
        return date == null
                ? ""
                : DATE_FORMAT.format(date);
    }

    private static String compactInstant(
            Object value
    ) {
        String text =
                safe(value);

        return text.length() > 19
                ? text.substring(0, 19)
                : text;
    }

    private static String money(
            BigDecimal amount,
            String currencyCode
    ) {
        return safe(currencyCode)
                + " "
                + (
                amount == null
                        ? BigDecimal.ZERO
                        : amount
        ).toPlainString();
    }

    private static String safe(
            Object value
    ) {
        return value == null
                ? ""
                : String.valueOf(value);
    }

    private static String escapeHtml(
            Object value
    ) {
        return safe(value)
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
