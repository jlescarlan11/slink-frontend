// pages/LoginPage.tsx
"use client";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormField } from "@/components/auth/FormField";
import { useAuth } from "@/contexts/AuthContext";
import { useFormValidation } from "@/hooks/useFormValidation";
import { handleAuthError } from "@/utils/errorHandlers";
import { LogIn } from "lucide-react";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";
import api from "../api/api";
import { loginFormSchema, LoginFormData } from "@/lib/schemas/authSchemas";
import { authFormFields } from "@/lib/config/formFields";
import { handleLoginResponse, createTokensObject } from "@/lib/api/responseHandlers";
import { ERROR_MESSAGES } from "@/lib/constants/errorMessages";
import { ROUTES } from "@/lib/config/routes";

// Use shared form fields configuration
const formFields = authFormFields.login;

const LoginPage = () => {
  const { login } = useAuth();
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
  } as LoginFormData);

  // Updated LoginPage.tsx - modified handleSubmit function
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const validatedData = loginFormSchema.parse(formData);
        setIsSubmitting(true);
        const response = await api.post(
          ROUTES.API.AUTH.LOGIN,
          validatedData
        );

        // Use shared response handler
        const { token, user } = handleLoginResponse(response);
        const tokens = createTokensObject(token);

        // Use the auth context login method
        login(tokens, user);

        resetForm();
        toast.success(ERROR_MESSAGES.LOGIN_SUCCESS, {
          description: `Welcome, ${user.username}!`,
        });

        // AuthContext will handle the redirect
      } catch (error) {
        // Use the standard error handling which will show toast for most errors
        // and only set field errors for validation issues
        handleAuthError(error, setErrors, "Login Failed");
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, resetForm, setErrors, login]
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
