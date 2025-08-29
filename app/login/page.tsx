// pages/LoginPage.tsx
"use client";
import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { LogIn } from "lucide-react";
import api from "../api/api";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormField } from "@/components/auth/FormField";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { useFormValidation } from "@/hooks/useFormValidation";
import { handleAuthError } from "@/utils/errorHandlers";
import { SecureTokenStorage } from "@/utils/tokenStorage";

const loginFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128),
});

const formFields = [
  {
    name: "username",
    label: "Username",
    type: "text",
    placeholder: "Enter your username",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
  },
] as const;

const LoginPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    formData,
    errors,
    hasErrors,
    handleFieldChange,
    resetForm,
    setErrors,
  } = useFormValidation(loginFormSchema, {
    username: "",
    password: "",
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        const validatedData = loginFormSchema.parse(formData);
        setIsSubmitting(true);

        const response = await api.post(
          "/api/auth/public/login",
          validatedData
        );

        // Handle token storage (extract SecureTokenStorage logic)
        const tokenStorage = SecureTokenStorage.getInstance();
        const { accessToken, refreshToken, expiresIn } = response.data;
        tokenStorage.setTokens(accessToken, refreshToken, expiresIn);

        resetForm();
        toast.success("Login Successful!", {
          description: `Welcome, ${
            response.data?.username || validatedData.username
          }!`,
        });

        router.push("/");
      } catch (error) {
        handleAuthError(error, setErrors, "Login Failed");
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, router, resetForm, setErrors]
  );

  const isFormValid =
    formData.username.length >= 3 && formData.password.length >= 8;

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your account">
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
          disabled={hasErrors || !isFormValid}
          loadingText="Signing In..."
          buttonText="Sign In"
          icon={LogIn}
        />
      </form>

      <AuthFooter
        text="Don't have an account?"
        linkText="Sign Up"
        linkHref="/register"
      />
    </AuthLayout>
  );
};

export default LoginPage;
