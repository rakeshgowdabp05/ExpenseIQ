import {
    apiClient,
    publicApiClient,
  } from "../api/apiClient";
  import { apiEndpoints } from "../config/appConfig";
  import { tokenStorage } from "./tokenStorage";
  
  function detectDeviceName() {
    const browserPlatform =
      navigator.userAgentData?.platform ||
      navigator.platform ||
      "Web";
  
    return `${browserPlatform} browser`;
  }
  
  export const authService = Object.freeze({
    async register(registrationData) {
      const response = await publicApiClient.post(
        apiEndpoints.register,
        registrationData,
      );
  
      return response.data;
    },
  
    async login(credentials) {
      const response = await publicApiClient.post(
        apiEndpoints.login,
        {
          ...credentials,
          deviceName: detectDeviceName(),
        },
      );
  
      return response.data;
    },

  async exchangeOAuthCode(code) {
    const response = await publicApiClient.post(
      apiEndpoints.oauthExchange,
      {
        code,
        deviceName: detectDeviceName(),
      },
    );

    return response.data;
  },
  
    async getCurrentUser() {
      const response = await apiClient.get(
        apiEndpoints.currentUser,
      );
  
      return response.data.data;
    },
  
    async logout() {
      const refreshToken =
        tokenStorage.getRefreshToken();
  
      if (!refreshToken) {
        return;
      }
  
      await publicApiClient.post(
        apiEndpoints.logout,
        {
          refreshToken,
        },
      );
    },
  });