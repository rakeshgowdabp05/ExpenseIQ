import { apiClient } from "../api/apiClient";
import { apiEndpoints } from "../config/appConfig";

function unwrapData(response) {
  return response.data?.data ?? response.data;
}

export const budgetService = {
  async getBudgets({
    month,
    active,
  } = {}) {
    const response = await apiClient.get(
      apiEndpoints.budgets,
      {
        params: {
          month: month || undefined,
          active:
            typeof active === "boolean"
              ? active
              : undefined,
        },
      },
    );

    return unwrapData(response) ?? [];
  },

  async getBudget(publicId) {
    const response = await apiClient.get(
      `${apiEndpoints.budgets}/${publicId}`,
    );

    return unwrapData(response);
  },

  async getSummary(month) {
    const response = await apiClient.get(
      `${apiEndpoints.budgets}/summary`,
      {
        params: {
          month: month || undefined,
        },
      },
    );

    return unwrapData(response);
  },

  async createBudget(payload) {
    const response = await apiClient.post(
      apiEndpoints.budgets,
      payload,
    );

    return unwrapData(response);
  },

  async updateBudget(
    publicId,
    payload,
  ) {
    const response = await apiClient.put(
      `${apiEndpoints.budgets}/${publicId}`,
      payload,
    );

    return unwrapData(response);
  },

  async updateBudgetStatus(
    publicId,
    active,
  ) {
    const response = await apiClient.patch(
      `${apiEndpoints.budgets}/${publicId}/status`,
      {
        active,
      },
    );

    return unwrapData(response);
  },

  async archiveBudget(publicId) {
    const response = await apiClient.delete(
      `${apiEndpoints.budgets}/${publicId}`,
    );

    return unwrapData(response);
  },
};