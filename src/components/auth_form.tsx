import { useState } from "react";
import { signUpUser, signInUser } from "../lib/auth";

type AuthFieldName = "displayName" | "email" | "password";
type AuthFieldErrors = Partial<Record<AuthFieldName, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export default function AuthForm() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isSigningUp, setIsSigningUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
  const [errorMessage, setErrorMessage] = useState("");

  function validateAuthForm(): AuthFieldErrors {
    const validationErrors: AuthFieldErrors = {};

    if (isSigningUp && !displayName.trim()) {
      validationErrors.displayName = "Display name is required.";
    }

    if (!email.trim()) {
      validationErrors.email = "Email is required.";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      validationErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      validationErrors.password = "Password is required.";
    } else if (isSigningUp && password.length < MIN_PASSWORD_LENGTH) {
      validationErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }

    return validationErrors;
  }
  
  function clearFieldError(fieldName: AuthFieldName) {
    setFieldErrors((previousValue) => ({ ...previousValue, [fieldName]: undefined }));
  }
  
  function switchMethod() {
    setIsSigningUp((previousValue) => !previousValue);
    setFieldErrors({});
    setErrorMessage("");
  }

  async function submitForm(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    const validationErrors = validateAuthForm();
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      if (isSigningUp) await signUpUser(
        email,
        password,
        displayName,
      )
      else await signInUser(
        email,
        password
      )
      setErrorMessage("Success! Check you email.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="modal_default px-10 py-12 w-md">
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
              className={`${fieldErrors.displayName ? "input_error" : "input_default"} transition_default`}
              id="display-name"
              name="display-name"
              type="text"
              placeholder="e.g., Alex Morgan"
              value={displayName}
              maxLength={50}
              required
              autoComplete="nickname"
              aria-invalid={!!fieldErrors.displayName}
              aria-describedby={fieldErrors.displayName ? "display-name-error" : undefined}
              onChange={(event) => {
                clearFieldError("displayName");
                setDisplayName(event.target.value);
              }}
            />
            {fieldErrors.displayName && (
              <p id="display-name-error" className="input_hint_error">
                {fieldErrors.displayName}
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
            onChange={(event) => {
              clearFieldError("email");
              setEmail(event.target.value);
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
              onClick={() => setShowPassword((previousValue) => !previousValue)}
              aria-controls="password"
              aria-pressed={showPassword}
            >{showPassword ? "Hide password" : "Show password"}
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
            onChange={(event) => {
              clearFieldError("password");
              setPassword(event.target.value);
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