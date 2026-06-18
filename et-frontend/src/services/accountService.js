import { apiClient } from "../api/apiClient";
import { apiEndpoints } from "../config/appConfig";

function getAccountPath(publicId) {
  return `${apiEndpoints.accounts}/${encodeURIComponent(
    publicId,
  )}`;
}

export const accountService = Object.freeze({
  async getAccounts(active) {
    const parameters = {};

    if (typeof active === "boolean") {
      parameters.active = active;
    }

    const response = await apiClient.get(
      apiEndpoints.accounts,
      {
        params: parameters,
      },
    );

    return response.data.data;
  },

  async getAccount(publicId) {
    const response = await apiClient.get(
      getAccountPath(publicId),
    );

    return response.data.data;
  },

  async createAccount(accountData) {
    const response = await apiClient.post(
      apiEndpoints.accounts,
      accountData,
    );

    return response.data;
  },

  async updateAccount(publicId, accountData) {
    const response = await apiClient.put(
      getAccountPath(publicId),
      accountData,
    );

    return response.data;
  },

  async updateAccountStatus(publicId, active) {
    const response = await apiClient.patch(
      `${getAccountPath(publicId)}/status`,
      {
        active,
      },
    );

    return response.data;
  },

  async archiveAccount(publicId) {
    const response = await apiClient.delete(
      getAccountPath(publicId),
    );

    return response.data;
  },
});