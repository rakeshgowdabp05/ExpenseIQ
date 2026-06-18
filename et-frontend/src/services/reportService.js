import { apiClient } from "../api/apiClient";
import { apiEndpoints } from "../config/appConfig";

function buildReportParams({
  fromDate,
  toDate,
} = {}) {
  const params = {};

  if (fromDate && toDate) {
    params.fromDate = fromDate;
    params.toDate = toDate;
  }

  return params;
}

function getFileNameFromDisposition(
  disposition,
  fallbackName,
) {
  if (!disposition) {
    return fallbackName;
  }

  const match = disposition.match(
    /filename="?([^"]+)"?/i,
  );

  return match?.[1] ?? fallbackName;
}

async function downloadExport({
  endpoint,
  fromDate,
  toDate,
  fallbackName,
  accept,
}) {
  const response = await apiClient.get(
    endpoint,
    {
      params: buildReportParams({
        fromDate,
        toDate,
      }),
      responseType: "blob",
      headers: {
        Accept: accept,
      },
    },
  );

  const fileName =
    getFileNameFromDisposition(
      response.headers?.["content-disposition"],
      fallbackName,
    );

  const blobUrl = window.URL.createObjectURL(
    response.data,
  );

  const anchor =
    document.createElement("a");

  anchor.href = blobUrl;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();

  window.URL.revokeObjectURL(blobUrl);
}

export const reportService = Object.freeze({
  async getReport({
    fromDate,
    toDate,
    signal,
  } = {}) {
    const response = await apiClient.get(
      apiEndpoints.reportsSummary,
      {
        params: buildReportParams({
          fromDate,
          toDate,
        }),
        signal,
      },
    );

    return response.data?.data ?? response.data;
  },

  async downloadCsv({
    fromDate,
    toDate,
  } = {}) {
    await downloadExport({
      endpoint: apiEndpoints.reportsCsv,
      fromDate,
      toDate,
      fallbackName: "financial-report.csv",
      accept: "text/csv",
    });
  },

  async downloadPdf({
    fromDate,
    toDate,
  } = {}) {
    await downloadExport({
      endpoint: apiEndpoints.reportsPdf,
      fromDate,
      toDate,
      fallbackName: "financial-report.pdf",
      accept: "application/pdf",
    });
  },

  async downloadXlsx({
    fromDate,
    toDate,
  } = {}) {
    await downloadExport({
      endpoint: apiEndpoints.reportsXlsx,
      fromDate,
      toDate,
      fallbackName: "financial-report.xlsx",
      accept:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  },
});
