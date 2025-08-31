// Shared form field configurations for authentication forms
export interface FormFieldConfig {
  name: string;
  label: string;
  type: string;
  placeholder: string;
}

export const authFormFields = {
  // Login form fields
  login: [
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
  ] as const,

  // Register form fields
  register: [
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
  ] as const,
};

// Helper function to get field names for type safety
export const getFieldNames = <T extends keyof typeof authFormFields>(
  formType: T
): readonly string[] => {
  return authFormFields[formType].map(field => field.name);
};
