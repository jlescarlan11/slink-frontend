// Enhanced form validation hook with availability checking
// hooks/useEnhancedFormValidation.ts
import { useCallback, useState } from "react";
import { z } from "zod";
import { useAvailabilityCheck } from "./useAvailabilityCheck";

export const useFormValidation = <T extends Record<string, string>>(
  schema: z.ZodSchema<T>,
  initialData: T,
  availabilityFields?: (keyof T)[]
) => {
  const [formData, setFormData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [availabilityErrors, setAvailabilityErrors] = useState<
    Partial<Record<keyof T, string>>
  >({});
  const { debouncedCheck } = useAvailabilityCheck();

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

      // Check availability for specific fields
      if (
        availabilityFields?.includes(fieldName) &&
        !fieldError &&
        value.length >= 3
      ) {
        // Clear previous availability error
        setAvailabilityErrors((prev) => ({ ...prev, [fieldName]: undefined }));

        // Debounced availability check
        debouncedCheck(fieldName as "username" | "email", value, (error) => {
          setAvailabilityErrors((prev) => ({
            ...prev,
            [fieldName]: error || undefined,
          }));
        });
      } else if (availabilityFields?.includes(fieldName)) {
        // Clear availability error if field is invalid or too short
        setAvailabilityErrors((prev) => ({ ...prev, [fieldName]: undefined }));
      }
    },
    [validateField, availabilityFields, debouncedCheck]
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
    setAvailabilityErrors({});
  }, [initialData]);

  const hasErrors = Object.values(errors).some(Boolean);
  const hasAvailabilityErrors = Object.values(availabilityErrors).some(Boolean);
  const hasAnyErrors = hasErrors || hasAvailabilityErrors;

  // Combine errors for display
  const combinedErrors: Partial<Record<keyof T, string>> = {
    ...errors,
    ...availabilityErrors,
  };

  return {
    formData,
    errors: combinedErrors,
    validationErrors: errors,
    availabilityErrors,
    hasErrors: hasAnyErrors,
    hasValidationErrors: hasErrors,
    hasAvailabilityErrors,
    setFormData,
    setErrors,
    handleFieldChange,
    validateForm,
    resetForm,
  };
};
