export function getApiErrorMessage(
    error,
    fallbackMessage,
  ) {
    const responseMessage =
      error?.response?.data?.message;
  
    if (responseMessage) {
      return responseMessage;
    }
  
    const validationErrors =
      error?.response?.data?.errors;
  
    if (validationErrors) {
      const firstValidationMessage =
        Object.values(validationErrors)[0];
  
      if (firstValidationMessage) {
        return firstValidationMessage;
      }
    }
  
    if (error?.code === "ECONNABORTED") {
      return "The request took too long. Please try again.";
    }
  
    if (!error?.response) {
      return "Unable to connect to the server. Check that the backend is running.";
    }
  
    return fallbackMessage;
  }