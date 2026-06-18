import { apiClient } from "../api/apiClient";
import { apiEndpoints } from "../config/appConfig";

function getResponseData(response) {
  return (
    response.data?.data ??
    response.data
  );
}

export const settingsService =
  Object.freeze({
    async getProfile(configuration = {}) {
      const response =
        await apiClient.get(
          apiEndpoints.currentUser,
          configuration,
        );

      return getResponseData(response);
    },

    async updateProfile(profileData) {
      const response =
        await apiClient.patch(
          apiEndpoints.updateProfile,
          profileData,
        );

      return response.data;
    },

    async updatePreferences(
      preferenceData,
    ) {
      const response =
        await apiClient.patch(
          apiEndpoints.updatePreferences,
          preferenceData,
        );

      return response.data;
    },

    async updateLocation(locationData) {
      const response =
        await apiClient.patch(
          apiEndpoints.updateLocation,
          locationData,
        );

      return response.data;
    },

    async changePassword(passwordData) {
      const response =
        await apiClient.post(
          apiEndpoints.changePassword,
          passwordData,
        );

      return response.data;
    },

    async getSessions(
      configuration = {},
    ) {
      const response =
        await apiClient.get(
          apiEndpoints.sessions,
          configuration,
        );

      const sessions =
        getResponseData(response);

      return Array.isArray(sessions)
        ? sessions
        : [];
    },

    async revokeSession(
      sessionPublicId,
    ) {
      const response =
        await apiClient.delete(
          apiEndpoints.session(
            sessionPublicId,
          ),
        );

      return response.data;
    },

    async revokeAllSessions() {
      const response =
        await apiClient.delete(
          apiEndpoints.sessions,
        );

      return response.data;
    },
  });