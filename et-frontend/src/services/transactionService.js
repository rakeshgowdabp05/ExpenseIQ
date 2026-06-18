import { apiClient } from "../api/apiClient";
import { apiEndpoints } from "../config/appConfig";

function getTransactionPath(publicId) {
  return `${apiEndpoints.transactions}/${encodeURIComponent(
    publicId,
  )}`;
}

function createQueryParameters(filters = {}) {
  const parameters = {
    page: filters.page,
    size: filters.size,
  };

  const optionalParameters = {
    type: filters.type,
    status: filters.status,
    accountPublicId: filters.accountPublicId,
    categoryPublicId: filters.categoryPublicId,
    fromDate: filters.fromDate,
    toDate: filters.toDate,
    search: filters.search,
  };

  Object.entries(optionalParameters).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value.toString().trim() !== ""
      ) {
        parameters[key] = value.toString().trim();
      }
    },
  );

  return parameters;
}

function createSuggestionParameters(
  options = {},
) {
  const parameters = {};

  if (options.type) {
    parameters.type = options.type;
  }

  if (
    options.query &&
    options.query.trim()
  ) {
    parameters.query =
      options.query.trim();
  }

  if (options.limit) {
    parameters.limit = options.limit;
  }

  return parameters;
}

export const transactionService =
  Object.freeze({
    async getTransactions(filters) {
      const response = await apiClient.get(
        apiEndpoints.transactions,
        {
          params:
            createQueryParameters(filters),
        },
      );

      return response.data.data;
    },

    async getTransaction(publicId) {
      const response = await apiClient.get(
        getTransactionPath(publicId),
      );

      return response.data.data;
    },

    async getSuggestions(options) {
      const response = await apiClient.get(
        apiEndpoints.transactionSuggestions,
        {
          params:
            createSuggestionParameters(
              options,
            ),
        },
      );

      return (
        response.data?.data ??
        response.data ??
        []
      );
    },

    async createTransaction(
      transactionData,
    ) {
      const response =
        await apiClient.post(
          apiEndpoints.transactions,
          transactionData,
        );

      return response.data;
    },

    async updateTransaction(
      publicId,
      transactionData,
    ) {
      const response =
        await apiClient.put(
          getTransactionPath(publicId),
          transactionData,
        );

      return response.data;
    },

    async uploadReceipt(publicId, file) {
      const formData = new FormData();

      formData.append("file", file);

      const response =
        await apiClient.post(
          apiEndpoints.transactionReceipt(publicId),
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );

      return response.data;
    },

    async getReceipt(publicId) {
      const response = await apiClient.get(
        apiEndpoints.transactionReceipt(publicId),
      );

      return response.data.data;
    },

    async downloadReceipt(publicId) {
      const response = await apiClient.get(
        apiEndpoints.transactionReceiptFile(publicId),
        {
          responseType: "blob",
          headers: {
            Accept: "*/*",
          },
        },
      );

      const disposition =
        response.headers["content-disposition"] ?? "";

      const fileNameMatch =
        disposition.match(/filename="?([^"]+)"?/i);

      return {
        blob: response.data,
        fileName:
          fileNameMatch?.[1] ??
          "transaction-receipt",
      };
    },

    async deleteReceipt(publicId) {
      const response =
        await apiClient.delete(
          apiEndpoints.transactionReceipt(publicId),
        );

      return response.data;
    },

    async cancelTransaction(publicId) {
      const response =
        await apiClient.delete(
          getTransactionPath(publicId),
        );

      return response.data;
    },
  });