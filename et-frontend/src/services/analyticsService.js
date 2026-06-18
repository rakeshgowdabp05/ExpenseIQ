import { apiClient } from "../api/apiClient";
import { apiEndpoints } from "../config/appConfig";

function buildAnalyticsParameters({
  fromDate,
  toDate,
} = {}) {
  const hasFromDate = Boolean(fromDate);
  const hasToDate = Boolean(toDate);

  if (hasFromDate !== hasToDate) {
    throw new Error(
      "Both analytics dates are required.",
    );
  }

  if (!hasFromDate) {
    return undefined;
  }

  return {
    fromDate,
    toDate,
  };
}

export const analyticsService =
  Object.freeze({
    async getAnalytics({
      fromDate,
      toDate,
      signal,
    } = {}) {
      const response =
        await apiClient.get(
          apiEndpoints.analytics,
          {
            params:
              buildAnalyticsParameters({
                fromDate,
                toDate,
              }),
            signal,
          },
        );

      return (
        response.data?.data ??
        response.data
      );
    },
  });
