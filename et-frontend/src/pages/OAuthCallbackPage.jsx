import {
  ShieldCheck,
} from "lucide-react";
import {
  useEffect,
  useRef,
} from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router";
import { appRoutes } from "../config/appConfig";
import { useAuth } from "../hooks/useAuth";

export default function OAuthCallbackPage() {
  const { loginWithOAuthCode } =
    useAuth();

  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) {
      return;
    }

    handled.current = true;

    const code =
      searchParams.get("code");

    if (!code) {
      navigate(appRoutes.login, {
        replace: true,
        state: {
          oauthError:
            "Social authentication did not return a valid login code.",
        },
      });

      return;
    }

    loginWithOAuthCode(code)
      .then(() => {
        navigate(
          appRoutes.workspace,
          {
            replace: true,
          },
        );
      })
      .catch(() => {
        navigate(appRoutes.login, {
          replace: true,
          state: {
            oauthError:
              "Social authentication could not be completed. Please try again.",
          },
        });
      });
  }, [
    loginWithOAuthCode,
    navigate,
    searchParams,
  ]);

  return (
    <main
      className="flex min-h-dvh items-center justify-center bg-[#f7f9fc] px-4 dark:bg-[#081222]"
      style={{
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <section className="w-full max-w-md rounded-[1.5rem] border border-slate-200 bg-white p-8 text-center shadow-[0_20px_55px_rgba(15,23,42,0.1)] dark:border-slate-800 dark:bg-[#101a2c]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300">
          <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-blue-100 border-t-[#1f55cf] dark:border-slate-700 dark:border-t-blue-300" />
        </div>

        <h1 className="mt-6 text-xl font-extrabold tracking-[-0.025em] text-[#080808] dark:text-white">
          Completing secure sign-in
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
          ExpenseIQ is validating the social provider response and preparing your private workspace.
        </p>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <ShieldCheck className="h-4 w-4 text-[#1f55cf] dark:text-blue-300" />
          Secure authentication in progress
        </div>
      </section>
    </main>
  );
}