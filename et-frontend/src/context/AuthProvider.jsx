import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { authService } from "../services/authService";
import { registrationRegionService } from "../services/registrationRegionService";
import { settingsService } from "../services/settingsService";
import { tokenStorage } from "../services/tokenStorage";
import { AuthContext } from "./auth-context";

const SESSION_EXPIRED_EVENT =
  "expense-tracker:session-expired";

function hasSavedLocation(user) {
  return (
    Number.isFinite(
      Number(
        user?.registrationLatitude,
      ),
    ) &&
    Number.isFinite(
      Number(
        user?.registrationLongitude,
      ),
    )
  );
}

export function AuthProvider({
  children,
}) {
  const hasStoredSession =
    tokenStorage.hasSession();

  const [user, setUser] =
    useState(null);

  const [
    authenticationStatus,
    setAuthenticationStatus,
  ] = useState(
    hasStoredSession
      ? "loading"
      : "anonymous",
  );

  const clearSession =
    useCallback(() => {
      tokenStorage.clearTokens();
      setUser(null);
      setAuthenticationStatus(
        "anonymous",
      );
    }, []);

  const captureLocationAfterLogin =
    useCallback(
      async (currentUser) => {
        if (
          hasSavedLocation(
            currentUser,
          )
        ) {
          return currentUser;
        }

        try {
          const location =
            await registrationRegionService
              .captureCurrentLocation();

          const response =
            await settingsService
              .updateLocation({
                latitude:
                  location.latitude,

                longitude:
                  location.longitude,

                regionCode:
                  location.regionCode,

                regionLabel:
                  location.regionLabel,

                timezone:
                  location.timezone,

                locationSource:
                  location.locationSource,
              });

          const updatedUser =
            response?.data ??
            response ??
            currentUser;

          setUser(updatedUser);

          return updatedUser;
        } catch {
          return currentUser;
        }
      },
      [],
    );

  const loadCurrentUser =
    useCallback(async () => {
      if (!tokenStorage.hasSession()) {
        return null;
      }

      try {
        const currentUser =
          await authService
            .getCurrentUser();

        setUser(currentUser);

        setAuthenticationStatus(
          "authenticated",
        );

        return currentUser;
      } catch {
        clearSession();
        return null;
      }
    }, [clearSession]);

  useEffect(() => {
    if (!hasStoredSession) {
      return undefined;
    }

    let active = true;

    authService
      .getCurrentUser()
      .then(async (currentUser) => {
        if (!active) {
          return;
        }

        setUser(currentUser);

        setAuthenticationStatus(
          "authenticated",
        );

        const updatedUser =
          await captureLocationAfterLogin(
            currentUser,
          );

        if (active) {
          setUser(updatedUser);
        }
      })
      .catch(() => {
        if (active) {
          clearSession();
        }
      });

    return () => {
      active = false;
    };
  }, [
    captureLocationAfterLogin,
    clearSession,
    hasStoredSession,
  ]);

  useEffect(() => {
    function handleSessionExpired() {
      clearSession();
    }

    window.addEventListener(
      SESSION_EXPIRED_EVENT,
      handleSessionExpired,
    );

    return () => {
      window.removeEventListener(
        SESSION_EXPIRED_EVENT,
        handleSessionExpired,
      );
    };
  }, [clearSession]);

  const contextValue =
    useMemo(
      () => ({
        user,

        authenticationStatus,

        isAuthenticated:
          authenticationStatus ===
          "authenticated",

        async register(
          registrationData,
        ) {
          return authService.register(
            registrationData,
          );
        },

        async login(credentials) {
          const loginResult =
            await authService.login(
              credentials,
            );

          tokenStorage.setTokens(
            loginResult.data.accessToken,
            loginResult.data
              .refreshToken,
          );

          const loggedInUser =
            loginResult.data.user;

          setUser(loggedInUser);

          setAuthenticationStatus(
            "authenticated",
          );

          const updatedUser =
            await captureLocationAfterLogin(
              loggedInUser,
            );

          setUser(updatedUser);

          return loginResult;
        },

        async loginWithOAuthCode(
          code,
        ) {
          const loginResult =
            await authService
              .exchangeOAuthCode(code);

          tokenStorage.setTokens(
            loginResult.data.accessToken,
            loginResult.data
              .refreshToken,
          );

          const loggedInUser =
            loginResult.data.user;

          setUser(loggedInUser);

          setAuthenticationStatus(
            "authenticated",
          );

          const updatedUser =
            await captureLocationAfterLogin(
              loggedInUser,
            );

          setUser(updatedUser);

          return loginResult;
        },

        async logout() {
          try {
            await authService.logout();
          } finally {
            clearSession();
          }
        },

        refreshCurrentUser:
          loadCurrentUser,
      }),
      [
        authenticationStatus,
        captureLocationAfterLogin,
        clearSession,
        loadCurrentUser,
        user,
      ],
    );

  return (
    <AuthContext.Provider
      value={contextValue}
    >
      {children}
    </AuthContext.Provider>
  );
}