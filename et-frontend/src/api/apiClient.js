import axios from "axios";
import {
  apiEndpoints,
  appConfig,
} from "../config/appConfig";
import { tokenStorage } from "../services/tokenStorage";

const defaultConfiguration = {
  baseURL: appConfig.apiBaseUrl,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
  timeout: 15000,
};

export const publicApiClient = axios.create(
  defaultConfiguration,
);

export const apiClient = axios.create(
  defaultConfiguration,
);

apiClient.interceptors.request.use(
  (configuration) => {
    const accessToken = tokenStorage.getAccessToken();

    if (accessToken) {
      configuration.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    return configuration;
  },
  (error) => Promise.reject(error),
);

let activeRefreshRequest = null;

async function refreshAuthenticationTokens() {
  const refreshToken = tokenStorage.getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token is available.");
  }

  const response = await publicApiClient.post(
    apiEndpoints.refresh,
    {
      refreshToken,
    },
  );

  const refreshedTokens = response.data.data;

  tokenStorage.setTokens(
    refreshedTokens.accessToken,
    refreshedTokens.refreshToken,
  );

  return refreshedTokens.accessToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    if (!tokenStorage.getRefreshToken()) {
      tokenStorage.clearTokens();
      window.dispatchEvent(
        new CustomEvent("expense-tracker:session-expired"),
      );

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!activeRefreshRequest) {
        activeRefreshRequest =
          refreshAuthenticationTokens().finally(() => {
            activeRefreshRequest = null;
          });
      }

      const newAccessToken =
        await activeRefreshRequest;

      originalRequest.headers =
        originalRequest.headers || {};

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      tokenStorage.clearTokens();

      window.dispatchEvent(
        new CustomEvent("expense-tracker:session-expired"),
      );

      return Promise.reject(refreshError);
    }
  },
);