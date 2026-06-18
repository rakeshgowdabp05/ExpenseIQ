const STORAGE_KEYS = Object.freeze({
    accessToken: "expense_tracker_access_token",
    refreshToken: "expense_tracker_refresh_token",
  });
  
  function getStorage() {
    return window.sessionStorage;
  }
  
  export const tokenStorage = Object.freeze({
    getAccessToken() {
      return getStorage().getItem(STORAGE_KEYS.accessToken);
    },
  
    getRefreshToken() {
      return getStorage().getItem(STORAGE_KEYS.refreshToken);
    },
  
    setTokens(accessToken, refreshToken) {
      if (!accessToken || !refreshToken) {
        throw new Error("Both access and refresh tokens are required.");
      }
  
      const storage = getStorage();
  
      storage.setItem(STORAGE_KEYS.accessToken, accessToken);
      storage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
    },
  
    clearTokens() {
      const storage = getStorage();
  
      storage.removeItem(STORAGE_KEYS.accessToken);
      storage.removeItem(STORAGE_KEYS.refreshToken);
    },
  
    hasSession() {
      return Boolean(
        this.getAccessToken() || this.getRefreshToken(),
      );
    },
  });