"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import api from "../api/api";

// Configuration
const REGISTER_ENDPOINT = "/api/auth/public/register";

// Zod Schema
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

// Form field configuration
const formFieldsConfig = [
  {
    name: "username" as keyof RegisterFormData,
    label: "Username",
    type: "text",
    placeholder: "Enter your username",
  },
  {
    name: "email" as keyof RegisterFormData,
    label: "Email",
    type: "email",
    placeholder: "Enter your email address",
  },
  {
    name: "password" as keyof RegisterFormData,
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
  },
];

// Simplified error types
const API_ERRORS = {
  409: "Username or email already exists.",
  422: "Please check your input fields.",
  500: "Something went wrong. Please try again later.",
  NETWORK: "Unable to connect to server. Please check your connection.",
} as const;

// Unified validation function
const validateField = (fieldName: keyof RegisterFormData, value: string) => {
  try {
    registerFormSchema.shape[fieldName].parse(value);
    return null;
  } catch (error) {
    return error instanceof z.ZodError ? error.issues[0]?.message : null;
  }
};

// Unified error handler
const handleError = (
  error: unknown,
  setErrors: (errors: Partial<RegisterFormData>) => void
) => {
  if (error instanceof z.ZodError) {
    // Handle validation errors
    const fieldErrors: Partial<RegisterFormData> = {};
    error.issues.forEach((issue) => {
      if (issue.path.length > 0) {
        fieldErrors[issue.path[0] as keyof RegisterFormData] = issue.message;
      }
    });
    setErrors(fieldErrors);
    toast.error("Validation Error", {
      description: "Please check your input.",
    });
    return;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const apiErrors = error.response?.data?.errors;

    // Handle field-specific API errors
    if (status === 422 && apiErrors) {
      const serverErrors: Partial<RegisterFormData> = {};
      Object.entries(apiErrors).forEach(([field, messages]) => {
        serverErrors[field as keyof RegisterFormData] = (
          messages as string[]
        )[0];
      });
      setErrors(serverErrors);
    }

    // Show appropriate toast message
    const message =
      status && status in API_ERRORS
        ? API_ERRORS[status as keyof typeof API_ERRORS]
        : !error.response
        ? API_ERRORS.NETWORK
        : API_ERRORS[500];

    toast.error("Registration Failed", { description: message });
    return;
  }

  // Fallback error
  toast.error("Error", { description: API_ERRORS[500] });
};

// Simplified API call
const registerUser = async (formData: RegisterFormData) => {
  const response = await api.post(REGISTER_ENDPOINT, formData);
  return response.data;
};

// Form Field Component
const FormField = ({
  config,
  value,
  onChange,
  error,
}: {
  config: (typeof formFieldsConfig)[0];
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
const useRegisterForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const fieldName = name as keyof RegisterFormData;

      setFormData((prev) => ({ ...prev, [fieldName]: value }));

      // Real-time validation
      const fieldError = validateField(fieldName, value);
      setErrors((prev) => ({ ...prev, [fieldName]: fieldError }));
    },
    []
  );

  const submitForm = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        const validatedData = registerFormSchema.parse(formData);
        setErrors({});
        setIsSubmitting(true);

        const response = await registerUser(validatedData);

        // Reset form and show success
        setFormData({ username: "", email: "", password: "" });
        toast.success("Registration Successful!", {
          description: `Welcome ${response.username}! Your account has been created.`,
        });

        setTimeout(() => router.push("/login"), 100);
      } catch (error) {
        handleError(error, setErrors);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, router]
  );

  const hasErrors = useMemo(
    () => Object.values(errors).some(Boolean),
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

// Main Component
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
            disabled={isSubmitting || hasErrors}
            className="w-full"
          >
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
