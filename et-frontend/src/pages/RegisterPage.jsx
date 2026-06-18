import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router";
import AuthLayout from "../components/AuthLayout";
import SocialAuthOptions from "../components/SocialAuthOptions";
import { appRoutes } from "../config/appConfig";
import { useAuth } from "../hooks/useAuth";
import { getApiErrorMessage } from "../utils/apiError";
import { registrationRegionService } from "../services/registrationRegionService";

const INITIAL_FORM_DATA = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState(INITIAL_FORM_DATA);

  const [showPassword, setShowPassword] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  function updateField(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setErrorMessage(
        "Password and confirmation do not match.",
      );

      return;
    }

    setSubmitting(true);

    try {
      const detectedRegion =
        await registrationRegionService.detect();

      const registrationResult =
        await register({
          firstName:
            formData.firstName.trim(),
          lastName:
            formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
          ...detectedRegion,
        });

      navigate(appRoutes.login, {
        replace: true,
        state: {
          registrationMessage:
            registrationResult.message,
        },
      });
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to create the account.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      description="Start a private workspace connected to your real financial activity."
      footer={
        <>
          Already registered?{" "}
          <Link
            to={appRoutes.login}
            className="font-extrabold text-[#1f55cf] transition hover:text-[#1848b5] dark:text-blue-300"
          >
            Sign in
          </Link>
        </>
      }
    >
      <div
        style={{
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        {errorMessage && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-3.5"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput
              icon={UserRound}
              label="First name"
              name="firstName"
              value={formData.firstName}
              onChange={updateField}
              autoComplete="given-name"
              placeholder="First name"
              minLength={2}
              maxLength={100}
              required
            />

            <TextInput
              icon={UserRound}
              label="Last name"
              name="lastName"
              value={formData.lastName}
              onChange={updateField}
              autoComplete="family-name"
              placeholder="Last name"
              maxLength={100}
            />
          </div>

          <TextInput
            icon={Mail}
            label="Email address"
            name="email"
            type="email"
            value={formData.email}
            onChange={updateField}
            autoComplete="email"
            placeholder="you@example.com"
            maxLength={255}
            required
          />

          <TextInput
            icon={Phone}
            label="Phone number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={updateField}
            autoComplete="tel"
            placeholder="Phone number (optional)"
            maxLength={20}
          />

          <PasswordInput
            label="Password"
            name="password"
            value={formData.password}
            onChange={updateField}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
          />

          <PasswordInput
            label="Confirm password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={updateField}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            autoComplete="new-password"
            placeholder="Re-enter password"
          />

          <button
            type="submit"
            disabled={submitting}
            className="auth-primary-button !mt-5 !h-[3.25rem] !rounded-xl !bg-[#1f55cf] !text-sm !font-extrabold shadow-[0_10px_22px_rgba(31,85,207,0.2)] transition hover:!bg-[#1848b5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              "Creating account..."
            ) : (
              <>
                Create secure account
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[0.7rem] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="h-4 w-4 text-[#1f55cf] dark:text-blue-300" />
            Your account remains connected to authenticated records
          </div>
        </form>

        <SocialAuthOptions className="mt-5" />
      </div>
    </AuthLayout>
  );
}

function TextInput({
  icon: Icon,
  label,
  ...inputProperties
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.78rem] font-extrabold text-[#0b1220] dark:text-white">
        {label}
      </span>

      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />

        <input
          {...inputProperties}
          className="auth-input !h-12 !rounded-xl pl-10.5 pr-3.5 text-sm"
        />
      </div>
    </label>
  );
}

function PasswordInput({
  label,
  showPassword,
  setShowPassword,
  ...inputProperties
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.78rem] font-extrabold text-[#0b1220] dark:text-white">
        {label}
      </span>

      <div className="relative">
        <LockKeyhole className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />

        <input
          {...inputProperties}
          type={
            showPassword
              ? "text"
              : "password"
          }
          required
          minLength={8}
          maxLength={72}
          className="auth-input !h-12 !rounded-xl pl-10.5 pr-11 text-sm"
        />

        <button
          type="button"
          onClick={() =>
            setShowPassword(
              (currentValue) =>
                !currentValue,
            )
          }
          aria-label={
            showPassword
              ? "Hide password"
              : "Show password"
          }
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#1f55cf] dark:hover:text-blue-300"
        >
          {showPassword ? (
            <EyeOff className="h-4.5 w-4.5" />
          ) : (
            <Eye className="h-4.5 w-4.5" />
          )}
        </button>
      </div>
    </label>
  );
}