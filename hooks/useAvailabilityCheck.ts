// hooks/useAvailabilityCheck.ts
import api from "@/app/api/api";
import { useCallback, useRef } from "react";

interface AvailabilityResponse {
  available: boolean;
  message?: string;
}

export const useAvailabilityCheck = () => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const checkAvailability = useCallback(
    async (
      field: "username" | "email",
      value: string
    ): Promise<string | null> => {
      if (!value || value.length < 3) return null;

      try {
        const response = await api.get<AvailabilityResponse>(
          `/api/auth/check-availability?${field}=${encodeURIComponent(value)}`
        );

        if (!response.data.available) {
          return field === "username"
            ? "This username is already taken"
            : "This email is already registered";
        }

        return null;
      } catch (error) {
        // Don't show error for availability check failures
        console.warn(`Failed to check ${field} availability:`, error);
        return null;
      }
    },
    []
  );

  const debouncedCheck = useCallback(
    (
      field: "username" | "email",
      value: string,
      setFieldError: (error: string | null) => void
    ) => {
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(async () => {
        const error = await checkAvailability(field, value);
        setFieldError(error);
      }, 500); // 500ms debounce
    },
    [checkAvailability]
  );

  return { checkAvailability, debouncedCheck };
};
