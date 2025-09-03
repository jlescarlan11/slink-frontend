// pages/RegisterPage.tsx
"use client";
import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import api from "../api/api";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormField } from "@/components/auth/FormField";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { useFormValidation } from "@/hooks/useFormValidation";
import { handleAuthError } from "@/utils/errorHandlers";
import {
  registerFormSchema,
  RegisterFormData,
} from "@/lib/schemas/authSchemas";
import { authFormFields } from "@/lib/config/formFields";
import { ERROR_MESSAGES } from "@/lib/constants/errorMessages";
import { ROUTES } from "@/lib/config/routes";

// Use shared form fields configuration
const formFields = authFormFields.register;

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
  } as RegisterFormData);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      try {
        const validatedData = registerFormSchema.parse(formData);
        setIsSubmitting(true);

        await api.post(ROUTES.API.AUTH.REGISTER, validatedData);

        resetForm();
        toast.success(ERROR_MESSAGES.REGISTRATION_SUCCESS, {
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
