// Enhanced form validation hook
// hooks/useFormValidation.ts
import { useCallback, useState } from "react";
import { z } from "zod";

export const useFormValidation = <T extends Record<string, string>>(
  schema: z.ZodSchema<T>,
  initialData: T
) => {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const validateField = useCallback(
    (fieldName: keyof T, value: string) => {
      try {
        const partialData = { [fieldName]: value } as Partial<T>;
        const result = schema.safeParse({
          ...initialData,
          ...partialData,
        });

        if (!result.success) {
          const fieldError = result.error.issues.find((issue) =>
            issue.path.includes(fieldName as string)
          );
          return fieldError?.message || null;
        }

        return null;
      } catch (error) {
        return error instanceof z.ZodError
          ? error.issues[0]?.message || null
          : null;
      }
    },
    [schema, initialData]
  );

  const handleFieldChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const fieldName = name as keyof T;

      setFormData((prev) => ({ ...prev, [fieldName]: value }));

      // Validate field format
      const fieldError = validateField(fieldName, value);
      setErrors((prev) => ({ ...prev, [fieldName]: fieldError || undefined }));
    },
    [validateField]
  );

  const validateForm = useCallback(() => {
    try {
      schema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof T, string>> = {};
        error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            const fieldName = issue.path[0] as keyof T;
            fieldErrors[fieldName] = issue.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  }, [formData, schema]);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData]);

  const hasErrors = Object.values(errors).some(Boolean);

  return {
    formData,
    errors,
    hasErrors,
    setFormData,
    setErrors,
    handleFieldChange,
    validateForm,
    resetForm,
  };
};
