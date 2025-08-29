// utils/errorHandlers.ts
import axios from "axios";
import { z } from "zod";
import { toast } from "sonner";

// Define types for API error responses
interface ApiErrorResponse {
  code?: string;
  message?: string;
  errors?: Record<string, string[]>;
  field?: string; // For specific field errors
}

// Enhanced error handler with specific field error mapping
export const handleAuthError = <T extends Record<string, string>>(
  error: unknown,
  setErrors: (errors: Partial<T>) => void,
  errorTitle: string = "Error"
): void => {
  if (error instanceof z.ZodError) {
    const fieldErrors = error.issues.reduce<Partial<T>>((acc, issue) => {
      if (issue.path.length > 0) {
        const fieldName = String(issue.path[0]) as keyof T;
        acc[fieldName] = issue.message as T[keyof T];
      }
      return acc;
    }, {});

    setErrors(fieldErrors);
    toast.error("Validation Error", {
      description: "Please check your input.",
    });
    return;
  }

  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const status = error.response?.status;
    const responseData = error.response?.data;
    const apiErrors = responseData?.errors;
    const errorCode = responseData?.code;
    const errorField = responseData?.field;

    // Handle field-specific API errors with detailed messages
    if (status === 422 && apiErrors) {
      const serverErrors = Object.entries(apiErrors).reduce<Partial<T>>(
        (acc, [field, messages]) => {
          if (messages?.[0]) {
            // Map specific error codes to user-friendly messages
            let errorMessage = messages[0];

            if (field === "username" && errorMessage.includes("already")) {
              errorMessage = "This username is already taken";
            } else if (field === "email" && errorMessage.includes("already")) {
              errorMessage = "This email is already registered";
            }

            acc[field as keyof T] = errorMessage as T[keyof T];
          }
          return acc;
        },
        {}
      );

      setErrors(serverErrors);
    }

    // Handle specific error cases with detailed messages
    const getErrorMessage = (): string => {
      switch (status) {
        case 401:
          return errorCode === "USER_NOT_FOUND"
            ? "No account found with this username"
            : "Incorrect username or password";

        case 409:
          // More specific conflict messages
          if (errorCode === "USERNAME_EXISTS") {
            return "This username is already taken. Please choose a different one.";
          } else if (errorCode === "EMAIL_EXISTS") {
            return "This email is already registered. Please use a different email or try signing in.";
          } else if (errorField === "username") {
            return "This username is already taken. Please choose a different one.";
          } else if (errorField === "email") {
            return "This email is already registered. Please use a different email or try signing in.";
          }
          return "Username or email already exists. Please use different credentials.";

        case 422:
          return "Please check your input fields and try again.";

        case 429:
          return "Too many attempts. Please wait a moment before trying again.";

        default:
          return !error.response
            ? "Unable to connect to server. Please check your internet connection."
            : "Something went wrong. Please try again.";
      }
    };

    toast.error(errorTitle, { description: getErrorMessage() });
    return;
  }

  // Fallback for unknown errors
  console.error("Unexpected error:", error);
  toast.error(errorTitle, {
    description: "Something went wrong. Please try again.",
  });
};
