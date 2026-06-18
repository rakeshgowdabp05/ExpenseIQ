import { apiClient } from "../api/apiClient";
import { apiEndpoints } from "../config/appConfig";

export const notificationService = Object.freeze({
  async getSummary() {
    const response = await apiClient.get(
      `${apiEndpoints.notifications}/summary`,
    );

    return response.data.data;
  },

  async getUnreadNotifications() {
    const params = new URLSearchParams();

    params.set("unreadOnly", "true");

    const response = await apiClient.get(
      `${apiEndpoints.notifications}?${params.toString()}`,
    );

    return response.data.data;
  },

  async generateAlerts() {
    const response = await apiClient.post(
      `${apiEndpoints.notifications}/generate`,
    );

    return response.data;
  },

  async markAsRead(publicId) {
    const response = await apiClient.patch(
      `${apiEndpoints.notifications}/${encodeURIComponent(
        publicId,
      )}/read`,
    );

    return response.data;
  },

  async markAllAsRead() {
    const response = await apiClient.patch(
      `${apiEndpoints.notifications}/read-all`,
    );

    return response.data;
  },

  async archive(publicId) {
    const response = await apiClient.delete(
      `${apiEndpoints.notifications}/${encodeURIComponent(
        publicId,
      )}`,
    );

    return response.data;
  },
});
