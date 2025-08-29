// pages/RegisterPage.tsx
"use client";
import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { UserPlus } from "lucide-react";
import api from "../api/api";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormField } from "@/components/auth/FormField";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { useFormValidation } from "@/hooks/useFormValidation";
import { handleAuthError } from "@/utils/errorHandlers";

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

const formFields = [
  {
    name: "username",
    label: "Username",
    type: "text",
    placeholder: "Enter your username",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "Enter your email address",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
  },
] as const;

const RegisterPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    formData,
    errors,
    hasErrors,
    handleFieldChange,
    resetForm,
    setErrors,
  } = useFormValidation(registerFormSchema, {
    username: "",
    email: "",
    password: "",
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        const validatedData = registerFormSchema.parse(formData);
        setIsSubmitting(true);

        await api.post("/api/auth/public/register", validatedData);

        resetForm();
        toast.success("Registration Successful!", {
          description: "Your account has been created.",
        });

        router.push("/login");
      } catch (error) {
        handleAuthError(error, setErrors, "Registration Failed");
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, router, resetForm, setErrors]
  );

  return (
    <AuthLayout title="Create Account" subtitle="Sign up to get started">
      <form onSubmit={handleSubmit} className="space-y-6">
        {formFields.map((field) => (
          <FormField
            key={field.name}
            name={field.name}
            label={field.label}
            type={field.type}
            placeholder={field.placeholder}
            value={formData[field.name as keyof typeof formData]}
            onChange={handleFieldChange}
            error={errors[field.name as keyof typeof errors]}
          />
        ))}

        <AuthButton
          isSubmitting={isSubmitting}
          disabled={hasErrors}
          loadingText="Signing Up..."
          buttonText="Sign Up"
          icon={UserPlus}
        />
      </form>

      <AuthFooter
        text="Already have an account?"
        linkText="Sign in"
        linkHref="/login"
      />
    </AuthLayout>
  );
};

export default RegisterPage;
