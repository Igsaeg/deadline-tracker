import { useState } from "react";
import { signUp, logIn } from "../lib/supabase/auth";

type FieldName = "display_name" | "email" | "password";
type FieldErrors = Partial<Record<FieldName, string>>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export default function Forms() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isSigningUp, setIsSigningUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState("");

  function validate(): FieldErrors {
    const errors: FieldErrors = {};

    if (isSigningUp && !displayName.trim()) {
      errors.display_name = "Display name is required.";
    }

    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (isSigningUp && password.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }

    return errors;
  }
  
  function clearFieldError(field: FieldName) {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  }
  
  function switchMethod() {
    setIsSigningUp((prev) => !prev);
    setFieldErrors({});
    setErrorMessage("");
  }

  async function submitForm(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);

    try {
      if (isSigningUp) await signUp(
        email,
        password,
        displayName,
      )
      else await logIn(
        email,
        password
      )
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="surface_default px-10 py-12 w-md">
      <div className="text-center mb-8">
        <h3 className="text-2xl mb-1.5">
          {isSigningUp ? "Let's get you started" : "Welcome back"}
        </h3>
        <p className="text-text-secondary">
          {isSigningUp ? "Takes less than a minute." : "Pick up right where you left off."}
        </p>
      </div>

      <form onSubmit={submitForm} noValidate className="flex flex-col gap-3">
        {isSigningUp && (
          <div className="flex flex-col gap-1">
            <label htmlFor="display-name" className="input_label">Display Name</label>
            <input
              className={`${fieldErrors.display_name ? "input_error" : "input_default"} transition_default`}
              id="display-name"
              name="display-name"
              type="text"
              placeholder="e.g., Alex Morgan"
              value={displayName}
              maxLength={50}
              required
              autoComplete="nickname"
              aria-invalid={!!fieldErrors.display_name}
              aria-describedby={fieldErrors.display_name ? "display-name-error" : undefined}
              onChange={(e) => {
                clearFieldError("display_name");
                setDisplayName(e.target.value);
              }}
            />
            {fieldErrors.display_name && (
              <p id="display-name-error" className="input_hint_error">
                {fieldErrors.display_name}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="input_label">Email Address</label>
          <input
            className={`${fieldErrors.email ? "input_error" : "input_default"} transition_default`}
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            required
            autoComplete="email"
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            onChange={(e) => {
              clearFieldError("email");
              setEmail(e.target.value);
            }}
          />
          {fieldErrors.email && (
            <p id="email-error" className="input_hint_error">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <label htmlFor="password" className="input_label">Password</label>
            <button
              className="button_text input_label text-sm"
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-controls="password"
              aria-pressed={showPassword}
            >
              {showPassword ? "Hide password" : "Show password"}
            </button>
          </div>

          <input
            className={`${fieldErrors.password ? "input_error" : "input_default"} transition_default`}
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder={isSigningUp ? "Create a password" : "Enter your password"}
            value={password}
            required
            autoComplete={isSigningUp ? "new-password" : "current-password"}
            aria-invalid={!!fieldErrors.password}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
            onChange={(e) => {
              clearFieldError("password");
              setPassword(e.target.value);
            }}
          />
          {fieldErrors.password && (
            <p id="password-error" className="input_hint_error">
              {fieldErrors.password}
            </p>
          )}
        </div>

        {errorMessage && <p role="alert" className="text-danger">{errorMessage}</p>}

        <button
          className={`transition_default w-full ${isSubmitting ? "button_disabled" : "button_accent"} ${errorMessage ? "" : "mt-5"}`}
          type="submit"
          disabled={isSubmitting}
        >{isSubmitting ? "Please wait..." : isSigningUp ? "Create account" : "Log in"}
        </button>
      </form>

      <p className="text-center mt-6">
        {isSigningUp ? "Already have an account?" : "Don't have an account?"}&nbsp;
        <button
          className="button_text"
          type="button"
          onClick={switchMethod}
        >{isSigningUp ? "Log in" : "Sign up"}
        </button>
      </p>
    </div>
  );
}