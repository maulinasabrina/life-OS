import { type InputHTMLAttributes, forwardRef } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, id, ...props }, ref) => {
    const fieldId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={fieldId}
          className="text-sm font-medium text-(--color-ink-soft)"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={fieldId}
          className="w-full rounded-lg border border-(--color-border) bg-(--color-paper-raised) px-3.5 py-2.5 text-(--color-ink) outline-none transition-colors placeholder:text-(--color-ink-soft)/50 focus-visible:border-(--color-sage) focus-visible:ring-2 focus-visible:ring-(--color-sage)/30"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${fieldId}-error`}
            role="alert"
            className="text-sm text-(--color-error)"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

TextField.displayName = 'TextField';
