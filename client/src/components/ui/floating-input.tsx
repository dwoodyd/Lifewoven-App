import * as React from "react";
import { cn } from "@/lib/utils";

interface FloatingInputProps extends React.ComponentProps<"input"> {
  label: string;
  error?: string;
  hint?: string;
}

/**
 * FloatingInput — branded text input with floating label.
 * The label floats up when the input has focus or a value.
 * Uses the Lifewoven brand focus ring (amber/primary).
 */
const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, hint, className, id, value, defaultValue, ...props }, ref) => {
    const inputId = id ?? `floating-${label.toLowerCase().replace(/\s+/g, "-")}`;
    const [hasValue, setHasValue] = React.useState(
      Boolean(value ?? defaultValue ?? "")
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      props.onChange?.(e);
    };

    // Keep hasValue in sync with controlled value
    React.useEffect(() => {
      if (value !== undefined) setHasValue(Boolean(value));
    }, [value]);

    return (
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          value={value}
          defaultValue={defaultValue}
          className={cn(
            "peer w-full rounded-lg border bg-background px-3 pb-2 pt-5 text-sm",
            "outline-none transition-all duration-200",
            "border-input hover:border-muted-foreground/60",
            "focus:border-primary focus:ring-2 focus:ring-primary/20",
            error
              ? "border-destructive focus:border-destructive focus:ring-destructive/20"
              : "",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          placeholder=" "
          onChange={handleChange}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            "pointer-events-none absolute left-3 select-none text-muted-foreground transition-all duration-200",
            // Floated state: small label above the value
            "peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-medium peer-focus:text-primary",
            // Has value but not focused
            hasValue ? "top-1.5 text-[10px] font-medium" : "top-3.5 text-sm",
            error ? "peer-focus:text-destructive" : ""
          )}
        >
          {label}
        </label>
        {error && (
          <p className="mt-1 text-xs text-destructive">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
    );
  }
);
FloatingInput.displayName = "FloatingInput";

interface FloatingTextareaProps extends React.ComponentProps<"textarea"> {
  label: string;
  error?: string;
  hint?: string;
}

/**
 * FloatingTextarea — same floating label pattern for multi-line input.
 */
const FloatingTextarea = React.forwardRef<HTMLTextAreaElement, FloatingTextareaProps>(
  ({ label, error, hint, className, id, value, defaultValue, ...props }, ref) => {
    const inputId = id ?? `floating-${label.toLowerCase().replace(/\s+/g, "-")}`;
    const [hasValue, setHasValue] = React.useState(
      Boolean(value ?? defaultValue ?? "")
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setHasValue(e.target.value.length > 0);
      props.onChange?.(e);
    };

    React.useEffect(() => {
      if (value !== undefined) setHasValue(Boolean(value));
    }, [value]);

    return (
      <div className="relative">
        <textarea
          ref={ref}
          id={inputId}
          value={value}
          defaultValue={defaultValue}
          className={cn(
            "peer w-full rounded-lg border bg-background px-3 pb-3 pt-6 text-sm",
            "outline-none transition-all duration-200 resize-none",
            "border-input hover:border-muted-foreground/60",
            "focus:border-primary focus:ring-2 focus:ring-primary/20",
            error
              ? "border-destructive focus:border-destructive focus:ring-destructive/20"
              : "",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          placeholder=" "
          onChange={handleChange}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            "pointer-events-none absolute left-3 select-none text-muted-foreground transition-all duration-200",
            "peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-medium peer-focus:text-primary",
            hasValue ? "top-1.5 text-[10px] font-medium" : "top-3.5 text-sm",
            error ? "peer-focus:text-destructive" : ""
          )}
        >
          {label}
        </label>
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
    );
  }
);
FloatingTextarea.displayName = "FloatingTextarea";

export { FloatingInput, FloatingTextarea };
