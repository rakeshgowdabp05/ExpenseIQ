package com.expensetracker.service.impl;

import com.expensetracker.dto.FinancialReportResponse;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

final class ReportXlsxWriter {

    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy");

    private static final DateTimeFormatter GENERATED_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");

    private static final int STANDARD_WIDTH =
            18;

    private static final int WIDE_WIDTH =
            30;

    private static final int DESCRIPTION_WIDTH =
            46;

    private ReportXlsxWriter() {
    }

    static byte[] write(
            FinancialReportResponse report,
            String brandName
    ) {
        try (
                Workbook workbook =
                        new XSSFWorkbook();

                ByteArrayOutputStream output =
                        new ByteArrayOutputStream()
        ) {
            WorkbookStyles styles =
                    createStyles(workbook);

            createSummarySheet(
                    workbook,
                    styles,
                    report,
                    brandName
            );

            createCategorySheet(
                    workbook,
                    styles,
                    report
            );

            createBudgetSheet(
                    workbook,
                    styles,
                    report
            );

            createGoalSheet(
                    workbook,
                    styles,
                    report
            );

            createTransactionSheet(
                    workbook,
                    styles,
                    report
            );

            workbook.setActiveSheet(0);
            workbook.write(output);

            return output.toByteArray();
        } catch (Exception exception) {
            throw new IllegalStateException(
                    "Unable to render financial report workbook.",
                    exception
            );
        }
    }

    private static void createSummarySheet(
            Workbook workbook,
            WorkbookStyles styles,
            FinancialReportResponse report,
            String brandName
    ) {
        Sheet sheet =
                workbook.createSheet("Summary");

        prepareSheet(sheet);

        int rowIndex =
                appendSheetTitle(
                        sheet,
                        styles,
                        0,
                        6,
                        brandName + " Financial Report",
                        "Executive overview generated from posted transactions, budgets, and goals."
                );

        rowIndex++;

        rowIndex = appendMetaRow(
                sheet,
                styles,
                rowIndex,
                "Report period",
                formatDate(report.fromDate())
                        + " to "
                        + formatDate(report.toDate())
        );

        rowIndex = appendMetaRow(
                sheet,
                styles,
                rowIndex,
                "Generated",
                formatGeneratedAt(report)
        );

        rowIndex = appendMetaRow(
                sheet,
                styles,
                rowIndex,
                "Timezone",
                safe(report.timezone())
        );

        rowIndex += 2;

        rowIndex = appendSectionLabel(
                sheet,
                styles,
                rowIndex,
                6,
                "Financial snapshot"
        );

        Row headerRow =
                sheet.createRow(rowIndex++);

        appendHeaderCells(
                headerRow,
                styles,
                List.of(
                        "Currency",
                        "Metric",
                        "Amount",
                        "Count"
                )
        );

        int tableStart =
                headerRow.getRowNum();

        for (
                FinancialReportResponse.CurrencyReport currency
                : safeCurrencies(report)
        ) {
            FinancialReportResponse.ReportTotals totals =
                    currency.totals();

            rowIndex = appendSummaryMetric(
                    sheet,
                    styles,
                    rowIndex,
                    currency.currencyCode(),
                    "Income",
                    totals.income(),
                    totals.incomeTransactionCount()
            );

            rowIndex = appendSummaryMetric(
                    sheet,
                    styles,
                    rowIndex,
                    currency.currencyCode(),
                    "Expenses",
                    totals.expense(),
                    totals.expenseTransactionCount()
            );

            rowIndex = appendSummaryMetric(
                    sheet,
                    styles,
                    rowIndex,
                    currency.currencyCode(),
                    "Net cash flow",
                    totals.netCashFlow(),
                    totals.transactionCount()
            );

            rowIndex = appendSummaryMetric(
                    sheet,
                    styles,
                    rowIndex,
                    currency.currencyCode(),
                    "Transfer volume",
                    totals.transferVolume(),
                    totals.transferTransactionCount()
            );
        }

        if (rowIndex == tableStart + 1) {
            rowIndex = appendEmptyRow(
                    sheet,
                    styles,
                    rowIndex,
                    4,
                    "No report rows are available for this period."
            );
        }

        applyFilter(
                sheet,
                tableStart,
                Math.max(tableStart, rowIndex - 1),
                3
        );

        finishSheet(
                sheet,
                4
        );
    }

    private static int appendSummaryMetric(
            Sheet sheet,
            WorkbookStyles styles,
            int rowIndex,
            String currencyCode,
            String metric,
            BigDecimal amount,
            long count
    ) {
        Row row =
                sheet.createRow(rowIndex);

        appendTextCell(
                row,
                0,
                currencyCode,
                styles.text()
        );

        appendTextCell(
                row,
                1,
                metric,
                styles.textStrong()
        );

        appendMoneyCell(
                row,
                2,
                amount,
                styles.money()
        );

        appendNumberCell(
                row,
                3,
                count,
                styles.number()
        );

        return rowIndex + 1;
    }

    private static void createCategorySheet(
            Workbook workbook,
            WorkbookStyles styles,
            FinancialReportResponse report
    ) {
        Sheet sheet =
                workbook.createSheet("Categories");

        prepareSheet(sheet);

        int rowIndex =
                appendSheetTitle(
                        sheet,
                        styles,
                        0,
                        5,
                        "Category Expense Report",
                        "Expense categories ranked by posted spending."
                );

        rowIndex++;

        Row headerRow =
                sheet.createRow(rowIndex++);

        appendHeaderCells(
                headerRow,
                styles,
                List.of(
                        "Currency",
                        "Category",
                        "Amount",
                        "Transactions",
                        "Share %"
                )
        );

        int tableStart =
                headerRow.getRowNum();

        for (
                FinancialReportResponse.CurrencyReport currency
                : safeCurrencies(report)
        ) {
            for (
                    FinancialReportResponse.CategoryReportRow row
                    : safeList(currency.categoryExpenses())
            ) {
                Row sheetRow =
                        sheet.createRow(rowIndex++);

                appendTextCell(
                        sheetRow,
                        0,
                        currency.currencyCode(),
                        styles.text()
                );

                appendTextCell(
                        sheetRow,
                        1,
                        row.categoryName(),
                        styles.textStrong()
                );

                appendMoneyCell(
                        sheetRow,
                        2,
                        row.amount(),
                        styles.money()
                );

                appendNumberCell(
                        sheetRow,
                        3,
                        row.transactionCount(),
                        styles.number()
                );

                appendMoneyCell(
                        sheetRow,
                        4,
                        row.percentageOfExpense(),
                        styles.percentage()
                );
            }
        }

        if (rowIndex == tableStart + 1) {
            rowIndex = appendEmptyRow(
                    sheet,
                    styles,
                    rowIndex,
                    5,
                    "No category expense rows are available."
            );
        }

        applyFilter(
                sheet,
                tableStart,
                Math.max(tableStart, rowIndex - 1),
                4
        );

        finishSheet(
                sheet,
                5
        );
    }

    private static void createBudgetSheet(
            Workbook workbook,
            WorkbookStyles styles,
            FinancialReportResponse report
    ) {
        Sheet sheet =
                workbook.createSheet("Budgets");

        prepareSheet(sheet);

        int rowIndex =
                appendSheetTitle(
                        sheet,
                        styles,
                        0,
                        7,
                        "Budget Performance",
                        "Budget limits compared with actual period spending."
                );

        rowIndex++;

        Row headerRow =
                sheet.createRow(rowIndex++);

        appendHeaderCells(
                headerRow,
                styles,
                List.of(
                        "Currency",
                        "Budget",
                        "Limit",
                        "Spent",
                        "Remaining",
                        "Usage %",
                        "Status"
                )
        );

        int tableStart =
                headerRow.getRowNum();

        for (
                FinancialReportResponse.CurrencyReport currency
                : safeCurrencies(report)
        ) {
            for (
                    FinancialReportResponse.BudgetReportRow row
                    : safeList(currency.budgets())
            ) {
                Row sheetRow =
                        sheet.createRow(rowIndex++);

                appendTextCell(
                        sheetRow,
                        0,
                        currency.currencyCode(),
                        styles.text()
                );

                appendTextCell(
                        sheetRow,
                        1,
                        row.budgetName(),
                        styles.textStrong()
                );

                appendMoneyCell(
                        sheetRow,
                        2,
                        row.limitAmount(),
                        styles.money()
                );

                appendMoneyCell(
                        sheetRow,
                        3,
                        row.spentAmount(),
                        styles.money()
                );

                appendMoneyCell(
                        sheetRow,
                        4,
                        row.remainingAmount(),
                        styles.money()
                );

                appendMoneyCell(
                        sheetRow,
                        5,
                        row.usagePercentage(),
                        styles.percentage()
                );

                appendTextCell(
                        sheetRow,
                        6,
                        row.status(),
                        styles.status()
                );
            }
        }

        if (rowIndex == tableStart + 1) {
            rowIndex = appendEmptyRow(
                    sheet,
                    styles,
                    rowIndex,
                    7,
                    "No budget rows are available."
            );
        }

        applyFilter(
                sheet,
                tableStart,
                Math.max(tableStart, rowIndex - 1),
                6
        );

        finishSheet(
                sheet,
                7
        );
    }

    private static void createGoalSheet(
            Workbook workbook,
            WorkbookStyles styles,
            FinancialReportResponse report
    ) {
        Sheet sheet =
                workbook.createSheet("Goals");

        prepareSheet(sheet);

        int rowIndex =
                appendSheetTitle(
                        sheet,
                        styles,
                        0,
                        8,
                        "Savings Goal Progress",
                        "Current progress against target savings goals."
                );

        rowIndex++;

        Row headerRow =
                sheet.createRow(rowIndex++);

        appendHeaderCells(
                headerRow,
                styles,
                List.of(
                        "Currency",
                        "Goal",
                        "Current",
                        "Target",
                        "Remaining",
                        "Progress %",
                        "Status",
                        "Target date"
                )
        );

        int tableStart =
                headerRow.getRowNum();

        for (
                FinancialReportResponse.CurrencyReport currency
                : safeCurrencies(report)
        ) {
            for (
                    FinancialReportResponse.GoalReportRow row
                    : safeList(currency.goals())
            ) {
                Row sheetRow =
                        sheet.createRow(rowIndex++);

                appendTextCell(
                        sheetRow,
                        0,
                        currency.currencyCode(),
                        styles.text()
                );

                appendTextCell(
                        sheetRow,
                        1,
                        row.goalName(),
                        styles.textStrong()
                );

                appendMoneyCell(
                        sheetRow,
                        2,
                        row.currentAmount(),
                        styles.money()
                );

                appendMoneyCell(
                        sheetRow,
                        3,
                        row.targetAmount(),
                        styles.money()
                );

                appendMoneyCell(
                        sheetRow,
                        4,
                        row.remainingAmount(),
                        styles.money()
                );

                appendMoneyCell(
                        sheetRow,
                        5,
                        row.progressPercentage(),
                        styles.percentage()
                );

                appendTextCell(
                        sheetRow,
                        6,
                        row.status(),
                        styles.status()
                );

                appendTextCell(
                        sheetRow,
                        7,
                        formatDate(row.targetDate()),
                        styles.text()
                );
            }
        }

        if (rowIndex == tableStart + 1) {
            rowIndex = appendEmptyRow(
                    sheet,
                    styles,
                    rowIndex,
                    8,
                    "No savings goal rows are available."
            );
        }

        applyFilter(
                sheet,
                tableStart,
                Math.max(tableStart, rowIndex - 1),
                7
        );

        finishSheet(
                sheet,
                8
        );
    }

    private static void createTransactionSheet(
            Workbook workbook,
            WorkbookStyles styles,
            FinancialReportResponse report
    ) {
        Sheet sheet =
                workbook.createSheet("Recent Transactions");

        prepareSheet(sheet);

        int rowIndex =
                appendSheetTitle(
                        sheet,
                        styles,
                        0,
                        8,
                        "Recent Transactions",
                        "Latest posted transaction records included in this report."
                );

        rowIndex++;

        Row headerRow =
                sheet.createRow(rowIndex++);

        appendHeaderCells(
                headerRow,
                styles,
                List.of(
                        "Currency",
                        "Date",
                        "Type",
                        "Account",
                        "Category",
                        "Amount",
                        "Merchant",
                        "Description"
                )
        );

        int tableStart =
                headerRow.getRowNum();

        for (
                FinancialReportResponse.CurrencyReport currency
                : safeCurrencies(report)
        ) {
            for (
                    FinancialReportResponse.TransactionReportRow row
                    : safeList(currency.recentTransactions())
            ) {
                Row sheetRow =
                        sheet.createRow(rowIndex++);

                appendTextCell(
                        sheetRow,
                        0,
                        currency.currencyCode(),
                        styles.text()
                );

                appendTextCell(
                        sheetRow,
                        1,
                        formatDate(row.transactionDate()),
                        styles.text()
                );

                appendTextCell(
                        sheetRow,
                        2,
                        row.transactionType(),
                        styles.textStrong()
                );

                appendTextCell(
                        sheetRow,
                        3,
                        row.accountName(),
                        styles.text()
                );

                appendTextCell(
                        sheetRow,
                        4,
                        row.categoryName(),
                        styles.text()
                );

                appendMoneyCell(
                        sheetRow,
                        5,
                        row.amount(),
                        styles.money()
                );

                appendTextCell(
                        sheetRow,
                        6,
                        row.merchantName(),
                        styles.text()
                );

                appendTextCell(
                        sheetRow,
                        7,
                        row.description(),
                        styles.text()
                );
            }
        }

        if (rowIndex == tableStart + 1) {
            rowIndex = appendEmptyRow(
                    sheet,
                    styles,
                    rowIndex,
                    8,
                    "No recent transaction rows are available."
            );
        }

        applyFilter(
                sheet,
                tableStart,
                Math.max(tableStart, rowIndex - 1),
                7
        );

        finishSheet(
                sheet,
                8
        );

        sheet.setColumnWidth(
                7,
                DESCRIPTION_WIDTH * 256
        );
    }

    private static int appendSheetTitle(
            Sheet sheet,
            WorkbookStyles styles,
            int rowIndex,
            int lastColumn,
            String title,
            String subtitle
    ) {
        Row titleRow =
                sheet.createRow(rowIndex++);

        titleRow.setHeightInPoints(28);

        Cell titleCell =
                titleRow.createCell(0);

        titleCell.setCellValue(title);
        titleCell.setCellStyle(styles.title());

        merge(
                sheet,
                titleRow.getRowNum(),
                0,
                lastColumn - 1
        );

        Row subtitleRow =
                sheet.createRow(rowIndex++);

        Cell subtitleCell =
                subtitleRow.createCell(0);

        subtitleCell.setCellValue(subtitle);
        subtitleCell.setCellStyle(styles.subtitle());

        merge(
                sheet,
                subtitleRow.getRowNum(),
                0,
                lastColumn - 1
        );

        return rowIndex + 1;
    }

    private static int appendSectionLabel(
            Sheet sheet,
            WorkbookStyles styles,
            int rowIndex,
            int lastColumn,
            String title
    ) {
        Row row =
                sheet.createRow(rowIndex++);

        Cell cell =
                row.createCell(0);

        cell.setCellValue(title);
        cell.setCellStyle(styles.sectionTitle());

        merge(
                sheet,
                row.getRowNum(),
                0,
                lastColumn - 1
        );

        return rowIndex;
    }

    private static int appendMetaRow(
            Sheet sheet,
            WorkbookStyles styles,
            int rowIndex,
            String label,
            String value
    ) {
        Row row =
                sheet.createRow(rowIndex);

        appendTextCell(
                row,
                0,
                label,
                styles.metaLabel()
        );

        appendTextCell(
                row,
                1,
                value,
                styles.metaValue()
        );

        return rowIndex + 1;
    }

    private static int appendEmptyRow(
            Sheet sheet,
            WorkbookStyles styles,
            int rowIndex,
            int columns,
            String message
    ) {
        Row row =
                sheet.createRow(rowIndex);

        Cell cell =
                row.createCell(0);

        cell.setCellValue(message);
        cell.setCellStyle(styles.empty());

        merge(
                sheet,
                rowIndex,
                0,
                Math.max(0, columns - 1)
        );

        return rowIndex + 1;
    }

    private static void appendHeaderCells(
            Row row,
            WorkbookStyles styles,
            List<String> headers
    ) {
        row.setHeightInPoints(23);

        for (int index = 0; index < headers.size(); index++) {
            Cell cell =
                    row.createCell(index);

            cell.setCellValue(headers.get(index));
            cell.setCellStyle(styles.header());
        }
    }

    private static void appendTextCell(
            Row row,
            int columnIndex,
            String value,
            CellStyle style
    ) {
        Cell cell =
                row.createCell(columnIndex);

        cell.setCellValue(safe(value));
        cell.setCellStyle(style);
    }

    private static void appendMoneyCell(
            Row row,
            int columnIndex,
            BigDecimal value,
            CellStyle style
    ) {
        Cell cell =
                row.createCell(columnIndex);

        cell.setCellValue(
                value == null
                        ? 0D
                        : value.doubleValue()
        );

        cell.setCellStyle(style);
    }

    private static void appendNumberCell(
            Row row,
            int columnIndex,
            long value,
            CellStyle style
    ) {
        Cell cell =
                row.createCell(columnIndex);

        cell.setCellValue(value);
        cell.setCellStyle(style);
    }

    private static void applyFilter(
            Sheet sheet,
            int headerRow,
            int lastRow,
            int lastColumn
    ) {
        sheet.setAutoFilter(
                new CellRangeAddress(
                        headerRow,
                        lastRow,
                        0,
                        lastColumn
                )
        );
    }

    private static void finishSheet(
            Sheet sheet,
            int columns
    ) {
        sheet.createFreezePane(0, 4);

        for (int index = 0; index < columns; index++) {
            sheet.setColumnWidth(
                    index,
                    STANDARD_WIDTH * 256
            );
        }

        if (columns > 1) {
            sheet.setColumnWidth(
                    1,
                    WIDE_WIDTH * 256
            );
        }
    }

    private static void prepareSheet(
            Sheet sheet
    ) {
        sheet.setDisplayGridlines(false);
    }

    private static void merge(
            Sheet sheet,
            int row,
            int firstColumn,
            int lastColumn
    ) {
        sheet.addMergedRegion(
                new CellRangeAddress(
                        row,
                        row,
                        firstColumn,
                        lastColumn
                )
        );
    }

    private static WorkbookStyles createStyles(
            Workbook workbook
    ) {
        Font titleFont =
                workbook.createFont();

        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 20);
        titleFont.setColor(IndexedColors.DARK_BLUE.getIndex());

        Font subtitleFont =
                workbook.createFont();

        subtitleFont.setFontHeightInPoints((short) 11);
        subtitleFont.setColor(IndexedColors.GREY_50_PERCENT.getIndex());

        Font sectionFont =
                workbook.createFont();

        sectionFont.setBold(true);
        sectionFont.setFontHeightInPoints((short) 13);
        sectionFont.setColor(IndexedColors.DARK_BLUE.getIndex());

        Font headerFont =
                workbook.createFont();

        headerFont.setBold(true);
        headerFont.setColor(IndexedColors.WHITE.getIndex());

        Font normalFont =
                workbook.createFont();

        normalFont.setFontHeightInPoints((short) 10);

        Font strongFont =
                workbook.createFont();

        strongFont.setBold(true);
        strongFont.setFontHeightInPoints((short) 10);

        CellStyle title =
                workbook.createCellStyle();

        title.setFont(titleFont);
        title.setVerticalAlignment(VerticalAlignment.CENTER);

        CellStyle subtitle =
                workbook.createCellStyle();

        subtitle.setFont(subtitleFont);

        CellStyle sectionTitle =
                workbook.createCellStyle();

        sectionTitle.setFont(sectionFont);
        sectionTitle.setFillForegroundColor(IndexedColors.PALE_BLUE.getIndex());
        sectionTitle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        addBorders(sectionTitle);

        CellStyle header =
                workbook.createCellStyle();

        header.setFont(headerFont);
        header.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        header.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        header.setAlignment(HorizontalAlignment.LEFT);
        header.setVerticalAlignment(VerticalAlignment.CENTER);
        addBorders(header);

        CellStyle metaLabel =
                workbook.createCellStyle();

        metaLabel.setFont(strongFont);
        metaLabel.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        metaLabel.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        addBorders(metaLabel);

        CellStyle metaValue =
                workbook.createCellStyle();

        metaValue.setFont(normalFont);
        metaValue.setWrapText(true);
        addBorders(metaValue);

        CellStyle text =
                workbook.createCellStyle();

        text.setFont(normalFont);
        text.setWrapText(true);
        text.setVerticalAlignment(VerticalAlignment.TOP);
        addBorders(text);

        CellStyle textStrong =
                workbook.createCellStyle();

        textStrong.cloneStyleFrom(text);
        textStrong.setFont(strongFont);

        CellStyle money =
                workbook.createCellStyle();

        money.cloneStyleFrom(text);
        money.setDataFormat(
                workbook
                        .createDataFormat()
                        .getFormat("#,##0.00")
        );

        CellStyle percentage =
                workbook.createCellStyle();

        percentage.cloneStyleFrom(text);
        percentage.setDataFormat(
                workbook
                        .createDataFormat()
                        .getFormat("0.00")
        );

        CellStyle number =
                workbook.createCellStyle();

        number.cloneStyleFrom(text);
        number.setDataFormat(
                workbook
                        .createDataFormat()
                        .getFormat("0")
        );

        CellStyle status =
                workbook.createCellStyle();

        status.cloneStyleFrom(textStrong);
        status.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
        status.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        CellStyle empty =
                workbook.createCellStyle();

        empty.cloneStyleFrom(text);
        empty.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        empty.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        return new WorkbookStyles(
                title,
                subtitle,
                sectionTitle,
                header,
                metaLabel,
                metaValue,
                text,
                textStrong,
                money,
                percentage,
                number,
                status,
                empty
        );
    }

    private static void addBorders(
            CellStyle style
    ) {
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setTopBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setRightBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setBottomBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setLeftBorderColor(IndexedColors.GREY_25_PERCENT.getIndex());
    }

    private static List<FinancialReportResponse.CurrencyReport>
    safeCurrencies(FinancialReportResponse report) {
        if (
                report == null
                || report.currencies() == null
        ) {
            return List.of();
        }

        return report.currencies();
    }

    private static <T> List<T> safeList(
            List<T> values
    ) {
        return values == null
                ? List.of()
                : values;
    }

    private static String formatDate(
            LocalDate date
    ) {
        return date == null
                ? ""
                : DATE_FORMAT.format(date);
    }

    private static String formatGeneratedAt(
            FinancialReportResponse report
    ) {
        if (
                report == null
                || report.generatedAt() == null
        ) {
            return "";
        }

        ZoneId zoneId;

        try {
            zoneId =
                    ZoneId.of(
                            safe(report.timezone())
                    );
        } catch (Exception exception) {
            zoneId =
                    ZoneId.systemDefault();
        }

        return GENERATED_FORMAT.format(
                report.generatedAt()
                        .atZone(zoneId)
        );
    }

    private static String safe(
            Object value
    ) {
        return value == null
                ? ""
                : String.valueOf(value);
    }

    private record WorkbookStyles(

            CellStyle title,

            CellStyle subtitle,

            CellStyle sectionTitle,

            CellStyle header,

            CellStyle metaLabel,

            CellStyle metaValue,

            CellStyle text,

            CellStyle textStrong,

            CellStyle money,

            CellStyle percentage,

            CellStyle number,

            CellStyle status,

            CellStyle empty
    ) {
    }
}
