import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router";
import AuthLayout from "../components/AuthLayout";
import SocialAuthOptions from "../components/SocialAuthOptions";
import { appRoutes } from "../config/appConfig";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { getApiErrorMessage } from "../utils/apiError";

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const registrationMessage =
    location.state?.registrationMessage;

  const oauthError =
    location.state?.oauthError ||
    new URLSearchParams(
      location.search,
    ).get("oauthError");

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
    setSubmitting(true);

    try {
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      toast.success({
        title: "Login successful",
        message: "Welcome back to your financial workspace.",
      });

      navigate(appRoutes.workspace, {
        replace: true,
      });
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Unable to sign in. Verify your email and password.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to continue to your private financial workspace."
      footer={
        <>
          New to ExpenseIQ?{" "}
          <Link
            to={appRoutes.register}
            className="font-extrabold text-[#1f55cf] transition hover:text-[#1848b5] dark:text-blue-300"
          >
            Create an account
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
        {registrationMessage && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            {registrationMessage}
          </div>
        )}

        {(oauthError || errorMessage) && (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
            {oauthError || errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <AuthField
            icon={Mail}
            label="Email address"
            type="email"
            name="email"
            value={formData.email}
            onChange={updateField}
            autoComplete="email"
            placeholder="you@example.com"
            required
          />

          <label className="block">
            <span className="mb-2 block text-[0.8rem] font-extrabold text-[#0b1220] dark:text-white">
              Password
            </span>

            <div className="relative">
              <LockKeyhole className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={formData.password}
                onChange={updateField}
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                className="auth-input !h-[3.25rem] !rounded-xl pl-11 pr-12 text-sm"
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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#1f55cf] dark:hover:text-blue-300"
              >
                {showPassword ? (
                  <EyeOff className="h-4.5 w-4.5" />
                ) : (
                  <Eye className="h-4.5 w-4.5" />
                )}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="auth-primary-button !mt-6 !h-[3.25rem] !rounded-xl !bg-[#1f55cf] !text-sm !font-extrabold shadow-[0_10px_22px_rgba(31,85,207,0.2)] transition hover:!bg-[#1848b5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              "Signing in..."
            ) : (
              <>
                Sign in securely
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 pt-1 text-[0.72rem] text-slate-500 dark:text-slate-400">
            <ShieldCheck className="h-4 w-4 text-[#1f55cf] dark:text-blue-300" />
            Protected access to user-owned records
          </div>
        </form>

        <SocialAuthOptions className="mt-6" />
      </div>
    </AuthLayout>
  );
}

function AuthField({
  icon: Icon,
  label,
  ...inputProperties
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.8rem] font-extrabold text-[#0b1220] dark:text-white">
        {label}
      </span>

      <div className="relative">
        <Icon className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />

        <input
          {...inputProperties}
          className="auth-input !h-[3.25rem] !rounded-xl pl-11 pr-4 text-sm"
        />
      </div>
    </label>
  );
}
