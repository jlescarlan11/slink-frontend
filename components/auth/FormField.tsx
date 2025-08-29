import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface FormFieldProps {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type,
  placeholder,
  value,
  onChange,
  error,
  required = true,
}) => (
  <div className="space-y-2">
    <Label htmlFor={name} className="text-sm font-medium text-foreground">
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </Label>
    <Input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={error ? "border-red-500 focus:border-red-500" : ""}
      aria-invalid={!!error}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);
