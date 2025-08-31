// Centralized error messages for authentication and validation
export const ERROR_MESSAGES = {
  // Authentication errors
  USERNAME_EXISTS: "This username is already taken",
  EMAIL_EXISTS: "This email is already registered",
  USER_NOT_FOUND: "No account found with this username",
  INVALID_CREDENTIALS: "Incorrect username or password",
  BAD_CREDENTIALS: "Invalid username or password. Please check your credentials and try again.",
  ACCOUNT_LOCKED: "Account is temporarily locked. Please try again later.",
  TOO_MANY_ATTEMPTS: "Too many login attempts. Please wait a moment before trying again.",
  
  // Validation errors
  VALIDATION_ERROR: "Please check your input",
  REQUIRED_FIELD: "This field is required",
  
  // Server errors
  INTERNAL_ERROR: "Internal server error. Please try again later.",
  CONNECTION_ERROR: "Unable to connect to server. Please check your internet connection.",
  GENERIC_ERROR: "Something went wrong. Please try again.",
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: "Too many attempts. Please wait a moment before trying again.",
  
  // Success messages
  LOGIN_SUCCESS: "Login Successful!",
  REGISTRATION_SUCCESS: "Registration Successful!",
  LOGOUT_SUCCESS: "Logged out successfully",
} as const;

// Error message getters for specific scenarios
export const getAuthErrorMessage = (status: number, errorCode?: string, errorField?: string): string => {
  switch (status) {
    case 401:
      return errorCode === "USER_NOT_FOUND" 
        ? ERROR_MESSAGES.USER_NOT_FOUND 
        : ERROR_MESSAGES.INVALID_CREDENTIALS;

    case 403:
      return ERROR_MESSAGES.BAD_CREDENTIALS;

    case 423:
      return ERROR_MESSAGES.ACCOUNT_LOCKED;

    case 409:
      if (errorCode === "USERNAME_EXISTS" || errorField === "username") {
        return ERROR_MESSAGES.USERNAME_EXISTS;
      } else if (errorCode === "EMAIL_EXISTS" || errorField === "email") {
        return ERROR_MESSAGES.EMAIL_EXISTS;
      }
      return "Username or email already exists. Please use different credentials.";

    case 422:
      return ERROR_MESSAGES.VALIDATION_ERROR;

    case 429:
      return ERROR_MESSAGES.RATE_LIMIT_EXCEEDED;

    case 500:
      return ERROR_MESSAGES.INTERNAL_ERROR;

    default:
      return ERROR_MESSAGES.GENERIC_ERROR;
  }
};
