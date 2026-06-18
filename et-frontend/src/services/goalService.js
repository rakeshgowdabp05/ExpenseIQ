import { apiClient } from "../api/apiClient";
import { apiEndpoints } from "../config/appConfig";

function unwrapData(response) {
  return (
    response.data?.data ??
    response.data
  );
}

function getGoalPath(publicId) {
  return `${apiEndpoints.goals}/${encodeURIComponent(
    publicId,
  )}`;
}

function getContributionPath(
  goalPublicId,
  contributionPublicId,
) {
  return `${getGoalPath(
    goalPublicId,
  )}/contributions/${encodeURIComponent(
    contributionPublicId,
  )}`;
}

export const goalService =
  Object.freeze({
    async getGoals(status) {
      const response =
        await apiClient.get(
          apiEndpoints.goals,
          {
            params: {
              status:
                status &&
                status !== "ALL"
                  ? status
                  : undefined,
            },
          },
        );

      return unwrapData(response) ?? [];
    },

    async getGoal(publicId) {
      const response =
        await apiClient.get(
          getGoalPath(publicId),
        );

      return unwrapData(response);
    },

    async getSummary() {
      const response =
        await apiClient.get(
          `${apiEndpoints.goals}/summary`,
        );

      return unwrapData(response);
    },

    async createGoal(payload) {
      const response =
        await apiClient.post(
          apiEndpoints.goals,
          payload,
        );

      return unwrapData(response);
    },

    async updateGoal(
      publicId,
      payload,
    ) {
      const response =
        await apiClient.put(
          getGoalPath(publicId),
          payload,
        );

      return unwrapData(response);
    },

    async updateGoalStatus(
      publicId,
      status,
    ) {
      const response =
        await apiClient.patch(
          `${getGoalPath(
            publicId,
          )}/status`,
          {
            status,
          },
        );

      return unwrapData(response);
    },

    async archiveGoal(publicId) {
      const response =
        await apiClient.delete(
          getGoalPath(publicId),
        );

      return unwrapData(response);
    },

    async addContribution(
      goalPublicId,
      payload,
    ) {
      const response =
        await apiClient.post(
          `${getGoalPath(
            goalPublicId,
          )}/contributions`,
          payload,
        );

      return unwrapData(response);
    },

    async getContributions(
      goalPublicId,
    ) {
      const response =
        await apiClient.get(
          `${getGoalPath(
            goalPublicId,
          )}/contributions`,
        );

      return unwrapData(response) ?? [];
    },

    async cancelContribution(
      goalPublicId,
      contributionPublicId,
    ) {
      const response =
        await apiClient.delete(
          getContributionPath(
            goalPublicId,
            contributionPublicId,
          ),
        );

      return unwrapData(response);
    },
  });