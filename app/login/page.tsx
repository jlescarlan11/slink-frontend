"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { Loader2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import api from "../api/api";

// Configuration
const LOGIN_ENDPOINT = "/api/auth/public/login";

// Zod Schema
const loginFormSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters"),
});

type LoginFormData = z.infer<typeof loginFormSchema>;

// Form field configuration
const formFieldsConfig = [
  {
    name: "username" as keyof LoginFormData,
    label: "Username",
    type: "text",
    placeholder: "Enter your username",
  },
  {
    name: "password" as keyof LoginFormData,
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
  },
] as const;

// Specific error messages
const ERROR_MESSAGES = {
  INVALID_CREDENTIALS:
    "Incorrect username or password. Please check your credentials and try again.",
  USER_NOT_FOUND:
    "No account found with this username. Please check your username or create a new account.",
  INVALID_PASSWORD:
    "Incorrect password. Please check your password and try again.",
  ACCOUNT_LOCKED:
    "Your account has been temporarily locked due to multiple failed attempts. Please try again later.",
  ACCOUNT_DISABLED:
    "Your account has been disabled. Please contact support for assistance.",
  VALIDATION_ERROR: "Please check your input fields.",
  SERVER_ERROR:
    "Something went wrong on our end. Please try again in a few moments.",
  NETWORK_ERROR:
    "Unable to connect to server. Please check your internet connection.",
  RATE_LIMITED:
    "Too many login attempts. Please wait a moment before trying again.",
} as const;

// Simplified error handler
const handleError = (
  error: unknown,
  setErrors: (errors: Partial<LoginFormData>) => void
) => {
  if (error instanceof z.ZodError) {
    const fieldErrors: Partial<LoginFormData> = {};
    error.issues.forEach((issue) => {
      if (issue.path.length > 0) {
        fieldErrors[issue.path[0] as keyof LoginFormData] = issue.message;
      }
    });
    setErrors(fieldErrors);
    toast.error("Validation Error", {
      description: ERROR_MESSAGES.VALIDATION_ERROR,
    });
    return;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const apiErrors = error.response?.data?.errors;
    const errorCode = error.response?.data?.code;
    const errorMessage = error.response?.data?.message;

    // Handle field-specific API errors
    if (status === 422 && apiErrors) {
      const serverErrors: Partial<LoginFormData> = {};
      Object.entries(apiErrors).forEach(([field, messages]) => {
        serverErrors[field as keyof LoginFormData] = (messages as string[])[0];
      });
      setErrors(serverErrors);
    }

    // Specific error message logic based on status and error codes
    let message: string;
    let title: string = "Login Failed";

    if (status === 401) {
      // Handle specific authentication errors
      switch (errorCode) {
        case "USER_NOT_FOUND":
          message = ERROR_MESSAGES.USER_NOT_FOUND;
          title = "User Not Found";
          break;
        case "INVALID_PASSWORD":
          message = ERROR_MESSAGES.INVALID_PASSWORD;
          title = "Incorrect Password";
          break;
        case "ACCOUNT_LOCKED":
          message = ERROR_MESSAGES.ACCOUNT_LOCKED;
          title = "Account Locked";
          break;
        case "ACCOUNT_DISABLED":
          message = ERROR_MESSAGES.ACCOUNT_DISABLED;
          title = "Account Disabled";
          break;
        default:
          message = ERROR_MESSAGES.INVALID_CREDENTIALS;
          break;
      }
    } else if (status === 400) {
      message = ERROR_MESSAGES.INVALID_CREDENTIALS;
    } else if (status === 403) {
      message = ERROR_MESSAGES.INVALID_CREDENTIALS;
    } else if (status === 422) {
      message = ERROR_MESSAGES.VALIDATION_ERROR;
    } else if (status === 429) {
      message = ERROR_MESSAGES.RATE_LIMITED;
      title = "Too Many Attempts";
    } else if (!error.response) {
      message = ERROR_MESSAGES.NETWORK_ERROR;
      title = "Connection Error";
    } else if (status >= 500) {
      message = ERROR_MESSAGES.SERVER_ERROR;
      title = "Server Error";
    } else {
      // Use server-provided message if available, otherwise fallback
      message = errorMessage || ERROR_MESSAGES.SERVER_ERROR;
    }

    toast.error(title, { description: message });
    return;
  }

  toast.error("Error", { description: ERROR_MESSAGES.SERVER_ERROR });
};

// Form Field Component
const FormField = ({
  config,
  value,
  onChange,
  error,
}: {
  config: (typeof formFieldsConfig)[number];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) => (
  <div className="space-y-2">
    <Label
      htmlFor={config.name}
      className="text-sm font-medium text-foreground"
    >
      {config.label}
      <span className="text-destructive ml-1">*</span>
    </Label>
    <Input
      id={config.name}
      name={config.name}
      type={config.type}
      value={value}
      onChange={onChange}
      placeholder={config.placeholder}
      className={error ? "border-red-500 focus:border-red-500" : ""}
      aria-invalid={!!error}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// Custom Hook
const useLoginForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const fieldName = name as keyof LoginFormData;

      setFormData((prev) => ({ ...prev, [fieldName]: value }));

      // Clear error when user starts typing
      if (errors[fieldName]) {
        setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
      }
    },
    [errors]
  );

  const submitForm = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        const validatedData = loginFormSchema.parse(formData);
        setErrors({});
        setIsSubmitting(true);

        const response = await api.post(LOGIN_ENDPOINT, validatedData);

        // Reset form and show success
        setFormData({ username: "", password: "" });
        toast.success("Login Successful!", {
          description: `Welcome back, ${
            response.data?.username || validatedData.username
          }!`,
        });

        // Redirect to dashboard
        setTimeout(() => router.push("/dashboard"), 100);
      } catch (error) {
        handleError(error, setErrors);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, router]
  );

  const hasErrors = Object.values(errors).some(Boolean);
  const isFormValid =
    formData.username.length >= 3 && formData.password.length >= 8;

  return {
    formData,
    errors,
    isSubmitting,
    hasErrors,
    isFormValid,
    handleFieldChange,
    submitForm,
  };
};

// Main Component
const LoginPage = () => {
  const {
    formData,
    errors,
    isSubmitting,
    hasErrors,
    isFormValid,
    handleFieldChange,
    submitForm,
  } = useLoginForm();

  return (
    <div className="section-spacing flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={submitForm} className="space-y-6">
          {formFieldsConfig.map((config) => (
            <FormField
              key={config.name}
              config={config}
              value={formData[config.name]}
              onChange={handleFieldChange}
              error={errors[config.name]}
            />
          ))}

          <Button
            type="submit"
            disabled={isSubmitting || hasErrors || !isFormValid}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Signing In...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </>
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <a href="/register" className="text-primary hover:underline">
            Create account
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
