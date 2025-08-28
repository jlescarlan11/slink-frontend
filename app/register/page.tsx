"use client";
import React, { useCallback, useState, useMemo } from "react";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import api from "../api/api";

// API Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
const REGISTER_ENDPOINT = "/api/auth/public/register";

// Zod Schema for Registration Form Validation
const registerFormSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must not exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    ),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must not exceed 255 characters"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

type RegisterFormData = z.infer<typeof registerFormSchema>;
type FormErrors = Partial<Record<keyof RegisterFormData, string>>;

// API Response Types
interface ApiSuccessResponse {
  username: string;
  email: string;
  password?: string; // Usually not returned for security, but matching your format
  id?: string; // In case your API returns an ID
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]> | string;
}

// Form State Management
const FORM_INITIAL_STATE: RegisterFormData = {
  username: "",
  email: "",
  password: "",
};

// Notification Messages
const NOTIFICATIONS = {
  success: {
    title: "Registration successful!",
    description: "Your account has been created successfully.",
  },
  validationError: {
    title: "Please check your input",
    description: "All fields must be filled correctly.",
  },
  duplicateError: {
    title: "Registration failed",
    description: "Username or email already exists.",
  },
  serverError: {
    title: "Server error",
    description: "Something went wrong. Please try again later.",
  },
  networkError: {
    title: "Network error",
    description: "Unable to connect to server. Please check your connection.",
  },
} as const;

// Request interceptor for logging (optional)
api.interceptors.request.use(
  (config) => {
    console.log(
      `Making ${config.method?.toUpperCase()} request to ${config.url}`
    );
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API Client Class
class RegisterApiClient {
  static async submitRegistration(
    formData: RegisterFormData
  ): Promise<ApiSuccessResponse> {
    try {
      console.log("Sending registration data:", formData);
      console.log("Full URL:", `${API_BASE_URL}${REGISTER_ENDPOINT}`);

      const response = await api.post<ApiSuccessResponse>(
        REGISTER_ENDPOINT,
        formData
      );

      console.log("Registration successful:", response.data);
      return response.data;
    } catch (error) {
      console.error("Registration error:", error);

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;

        // Handle different scenarios
        if (axiosError.response) {
          // Server responded with error status
          const status = axiosError.response.status;
          const errorData = axiosError.response.data;

          console.error("Server error response:", status, errorData);

          switch (status) {
            case 400:
              throw new Error("VALIDATION_ERROR", { cause: errorData });
            case 409:
              throw new Error("DUPLICATE_ERROR", { cause: errorData });
            case 422:
              throw new Error("FIELD_VALIDATION_ERROR", { cause: errorData });
            case 500:
              throw new Error("SERVER_ERROR", { cause: errorData });
            default:
              throw new Error("API_ERROR", { cause: errorData });
          }
        } else if (axiosError.request) {
          // Network error - no response received
          console.error("Network error - no response:", axiosError.request);
          console.error("Possible causes: CORS, server not running, wrong URL");
          throw new Error("NETWORK_ERROR");
        } else {
          // Request setup error
          console.error("Request setup error:", axiosError.message);
          throw new Error("REQUEST_SETUP_ERROR");
        }
      }

      // Re-throw non-axios errors
      throw error;
    }
  }
}

// Form Field Configuration
interface FormFieldConfig {
  id: string;
  name: keyof RegisterFormData;
  label: string;
  type: string;
  placeholder: string;
}

const FORM_FIELDS: FormFieldConfig[] = [
  {
    id: "username",
    name: "username",
    label: "Username",
    type: "text",
    placeholder: "Enter your username",
  },
  {
    id: "email",
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "Enter your email address",
  },
  {
    id: "password",
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
  },
];

// Form Field Component
const FormField = ({
  id,
  name,
  label,
  type,
  placeholder,
  value,
  onChange,
  error,
}: {
  id: string;
  name: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}) => {
  const hasError = Boolean(error);

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        <span className="text-destructive ml-1">*</span>
      </Label>

      <Input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${hasError ? "border-red-500 focus:border-red-500" : ""}`}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : undefined}
      />

      {hasError && (
        <p id={`${id}-error`} className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

// Submit Button Component
const SubmitButton = ({
  isSubmitting,
  hasErrors,
}: {
  isSubmitting: boolean;
  hasErrors: boolean;
}) => (
  <Button type="submit" disabled={isSubmitting || hasErrors} className="w-full">
    {isSubmitting ? (
      <>
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        Creating Account...
      </>
    ) : (
      <>
        <UserPlus className="w-4 h-4 mr-2" />
        Create Account
      </>
    )}
  </Button>
);

// Custom Hook for Form Management
const useRegisterForm = () => {
  const [formData, setFormData] =
    useState<RegisterFormData>(FORM_INITIAL_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const fieldName = name as keyof RegisterFormData;

      setFormData((prev) => ({ ...prev, [fieldName]: value }));

      // Real-time validation for individual field
      try {
        const fieldSchema = registerFormSchema.shape[fieldName];
        fieldSchema.parse(value);
        setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
      } catch (error) {
        if (error instanceof z.ZodError) {
          setErrors((prev) => ({
            ...prev,
            [fieldName]: error.issues[0]?.message,
          }));
        }
      }
    },
    []
  );

  const resetForm = useCallback(() => {
    setFormData(FORM_INITIAL_STATE);
    setErrors({});
  }, []);

  const submitForm = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        // Validate entire form with Zod
        const validatedData = registerFormSchema.parse(formData);
        setErrors({});

        setIsSubmitting(true);

        const response = await RegisterApiClient.submitRegistration(
          validatedData
        );

        resetForm();
        toast.success(NOTIFICATIONS.success.title, {
          description: `Welcome ${response.username}! Your account has been created.`,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Handle Zod validation errors
          const fieldErrors: FormErrors = {};
          error.issues.forEach((issue: z.ZodIssue) => {
            if (issue.path.length > 0) {
              const fieldName = issue.path[0] as keyof RegisterFormData;
              fieldErrors[fieldName] = issue.message;
            }
          });
          setErrors(fieldErrors);
          toast.error(NOTIFICATIONS.validationError.title, {
            description: NOTIFICATIONS.validationError.description,
          });
        } else if (error instanceof Error) {
          // Handle API errors
          console.error("Registration failed:", error);

          switch (error.message) {
            case "DUPLICATE_ERROR":
              toast.error(NOTIFICATIONS.duplicateError.title, {
                description: NOTIFICATIONS.duplicateError.description,
              });
              break;
            case "VALIDATION_ERROR":
            case "FIELD_VALIDATION_ERROR":
              // Handle server-side validation errors
              const apiErrorData = (error.cause as ApiErrorResponse)?.errors;
              if (apiErrorData) {
                const serverErrors: FormErrors = {};
                Object.entries(apiErrorData).forEach(([field, messages]) => {
                  if (messages.length > 0) {
                    serverErrors[field as keyof RegisterFormData] = messages[0];
                  }
                });
                setErrors(serverErrors);
              }
              toast.error(NOTIFICATIONS.validationError.title, {
                description:
                  (error.cause as ApiErrorResponse)?.message ||
                  NOTIFICATIONS.validationError.description,
              });
              break;
            case "NETWORK_ERROR":
              toast.error(NOTIFICATIONS.networkError.title, {
                description: NOTIFICATIONS.networkError.description,
              });
              break;
            default:
              toast.error(NOTIFICATIONS.serverError.title, {
                description: NOTIFICATIONS.serverError.description,
              });
          }
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, resetForm]
  );

  const hasErrors = useMemo(
    () => Object.values(errors).some((error) => Boolean(error)),
    [errors]
  );

  return {
    formData,
    errors,
    isSubmitting,
    hasErrors,
    handleFieldChange,
    submitForm,
  };
};

// Main Registration Page Component
const RegisterPage = () => {
  const {
    formData,
    errors,
    isSubmitting,
    hasErrors,
    handleFieldChange,
    submitForm,
  } = useRegisterForm();

  return (
    <div className="section-spacing flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Sign up to get started
          </p>
        </div>

        <form onSubmit={submitForm} className="space-y-6">
          {FORM_FIELDS.map((field) => (
            <FormField
              key={field.id}
              {...field}
              name={field.name}
              value={formData[field.name]}
              onChange={handleFieldChange}
              error={errors[field.name]}
            />
          ))}

          <SubmitButton isSubmitting={isSubmitting} hasErrors={hasErrors} />
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/login" className="text-primary hover:underline">
            Sign in
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
