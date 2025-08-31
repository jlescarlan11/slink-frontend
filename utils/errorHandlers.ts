// utils/errorHandlers.ts
import axios from "axios";
import { z } from "zod";
import { toast } from "sonner";
import { ERROR_MESSAGES, getAuthErrorMessage } from "@/lib/constants/errorMessages";

// Define types for API error responses
interface ApiErrorResponse {
  code?: string;
  message?: string;
  errors?: Record<string, string[]>;
  field?: string; // For specific field errors
  status?: number;
  error?: string;
  trace?: string; // For detailed error information
}

// Enhanced error handler with specific field error mapping
export const handleAuthError = <T extends Record<string, string>>(
  error: unknown,
  setErrors: (errors: Partial<T>) => void,
  errorTitle: string = "Error"
): void => {
  if (error instanceof z.ZodError) {
    // Only set field errors for validation errors, no toast
    const fieldErrors = error.issues.reduce<Partial<T>>((acc, issue) => {
      if (issue.path.length > 0) {
        const fieldName = String(issue.path[0]) as keyof T;
        acc[fieldName] = issue.message as T[keyof T];
      }
      return acc;
    }, {});

    setErrors(fieldErrors);
    return;
  }

  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const status = error.response?.status;
    const responseData = error.response?.data;
    const apiErrors = responseData?.errors;
    const errorCode = responseData?.code;
    const errorField = responseData?.field;
    const errorMessage = responseData?.message;
    const errorTrace = responseData?.trace;

    // Handle field-specific API errors with detailed messages (no toast)
    if (status === 422 && apiErrors) {
      const serverErrors = Object.entries(apiErrors).reduce<Partial<T>>(
        (acc, [field, messages]) => {
          if (messages?.[0]) {
            // Map specific error codes to user-friendly messages
            let errorMessage = messages[0];

            if (field === "username" && errorMessage.includes("already")) {
              errorMessage = ERROR_MESSAGES.USERNAME_EXISTS;
            } else if (field === "email" && errorMessage.includes("already")) {
              errorMessage = ERROR_MESSAGES.EMAIL_EXISTS;
            }

            acc[field as keyof T] = errorMessage as T[keyof T];
          }
          return acc;
        },
        {}
      );

      setErrors(serverErrors);
      return; // Don't show toast for field-specific errors
    }

    // Handle 500 status with specific username/email exists messages
    if (status === 500 && errorMessage) {
      if (errorMessage.toLowerCase().includes("username already exists")) {
        toast.error("Username Already Exists", {
          description: "Please choose a different username.",
        });
        return;
      } else if (errorMessage.toLowerCase().includes("email already exists")) {
        toast.error("Email Already Exists", {
          description: "Please use a different email or try signing in.",
        });
        return;
      }
    }

    // Handle specific error messages from backend
    if (status === 403) {
      // Check if it's a bad credentials error from the trace
      if (errorTrace?.toLowerCase().includes("badcredentialsexception") || 
          errorMessage?.toLowerCase().includes("bad credentials") ||
          errorMessage?.toLowerCase().includes("forbidden")) {
        toast.error("Login Failed", { 
          description: ERROR_MESSAGES.BAD_CREDENTIALS 
        });
        return;
      }
    }

    // Handle account locked errors
    if (status === 423) {
      toast.error("Account Locked", { 
        description: ERROR_MESSAGES.ACCOUNT_LOCKED 
      });
      return;
    }

    // Use centralized error message handler
    const errorMessageText = getAuthErrorMessage(status || 0, errorCode, errorField);

    toast.error(errorTitle, { description: errorMessageText });
    return;
  }

  // Fallback for unknown errors
  console.error("Unexpected error:", error);
  toast.error(errorTitle, {
    description: "Something went wrong. Please try again.",
  });
};
