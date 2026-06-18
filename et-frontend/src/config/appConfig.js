function getRequiredEnvironmentValue(
  key,
) {
  const value = import.meta.env[key];

  if (!value || !value.trim()) {
    throw new Error(
      `Missing required environment variable: ${key}`,
    );
  }

  return value.trim();
}

function getOptionalEnvironmentValue(
  key,
  fallbackValue = "",
) {
  const value = import.meta.env[key];

  return value && value.trim()
    ? value.trim()
    : fallbackValue;
}

const apiBaseUrl =
  getRequiredEnvironmentValue(
    "VITE_API_BASE_URL",
  ).replace(/\/+$/, "");

const backendOrigin = new URL(
  apiBaseUrl,
  window.location.origin,
).origin;

const reverseGeocodingUrl =
  getOptionalEnvironmentValue(
    "VITE_REVERSE_GEOCODING_URL",
  ).replace(/\/+$/, "");

export const appConfig =
  Object.freeze({
    appName:
      getRequiredEnvironmentValue(
        "VITE_APP_NAME",
      ),

    apiBaseUrl,

    backendOrigin,

    tagline:
      "See your money clearly.",

    reverseGeocoding:
      Object.freeze({
        enabled:
          getOptionalEnvironmentValue(
            "VITE_REVERSE_GEOCODING_ENABLED",
            "true",
          ).toLowerCase() === "true",

        url: reverseGeocodingUrl,
      }),

    socialAuthStart(provider) {
      return `${backendOrigin}/api/v1/auth/oauth/start/${encodeURIComponent(
        provider,
      )}`;
    },
  });

export const appRoutes =
  Object.freeze({
    root: "/",

    login: "/login",

    register: "/register",

    oauthCallback:
      "/oauth/callback",

    workspace: "/app",

    dashboard:
      "/app/dashboard",

    accounts:
      "/app/accounts",

    transactions:
      "/app/transactions",

    categories:
      "/app/categories",

    budgets:
      "/app/budgets",

    goals:
      "/app/goals",

    analytics:
      "/app/analytics",

    reports:
      "/app/reports",

    settings:
      "/app/settings",
  });

export const apiEndpoints =
  Object.freeze({
    register:
      "/auth/register",

    login:
      "/auth/login",

    oauthExchange:
      "/auth/oauth/exchange",

    refresh:
      "/auth/refresh",

    logout:
      "/auth/logout",

    currentUser:
      "/users/me",

    updateProfile:
      "/users/me/profile",

    updatePreferences:
      "/users/me/preferences",

    updateLocation:
      "/users/me/location",

    changePassword:
      "/users/me/change-password",

    sessions:
      "/users/me/sessions",

    session(sessionPublicId) {
      return `/users/me/sessions/${encodeURIComponent(
        sessionPublicId,
      )}`;
    },

    dashboard:
      "/dashboard",

    accounts:
      "/accounts",

    categories:
      "/categories",

    transactions:
      "/transactions",

    transactionSuggestions:
      "/transactions/suggestions",

    transactionReceipt(publicId) {
      return `/transactions/${encodeURIComponent(
        publicId,
      )}/receipt`;
    },

    transactionReceiptFile(publicId) {
      return `/transactions/${encodeURIComponent(
        publicId,
      )}/receipt/file`;
    },

    budgets:
      "/budgets",

    goals:
      "/goals",

    analytics:
      "/analytics",

    reportsSummary:
      "/reports/summary",

    reportsCsv:
      "/reports/exports/csv",

    reportsPdf:
      "/reports/exports/pdf",

    reportsXlsx:
      "/reports/exports/xlsx",

    notifications:
      "/notifications",
  });
