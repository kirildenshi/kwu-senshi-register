'use client';

interface FormErrorProps {
  fieldName: string;
  message?: string;
}

export default function FormError({ fieldName, message }: FormErrorProps) {
  if (!message) return null;

  return (
    <p
      id={`${fieldName}-error`}
      role="alert"
      className="login-error-animate mt-2 text-(length:--login-text-xs) font-medium text-red-400"
    >
      {message}
    </p>
  );
}
