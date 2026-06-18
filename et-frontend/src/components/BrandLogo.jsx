import { Link } from "react-router";
import { appConfig, appRoutes } from "../config/appConfig";

export default function BrandLogo({
  compact = false,
  light = false,
  fixedLight = false,
  className = "",
}) {
  const wordColor = light
    ? "text-white"
    : fixedLight
      ? "text-[#0b1220]"
      : "text-[#0b1220] dark:text-white";

  const subColor = light
    ? "text-blue-100"
    : fixedLight
      ? "text-slate-500"
      : "text-slate-500 dark:text-slate-400";

  return (
    <Link
      to={appRoutes.root}
      className={`inline-flex items-center gap-3 ${className}`}
    >
      <img
        src="/brand/expenseiq-icon.png"
        alt=""
        aria-hidden="true"
        className="h-11 w-11 shrink-0 rounded-2xl object-contain shadow-sm"
      />

      {!compact && (
        <span className="leading-none">
          <span className={`block text-base font-black tracking-tight ${wordColor}`}>
            {appConfig.appName}
          </span>

          <span className={`mt-1 block text-[0.64rem] font-black uppercase tracking-[0.16em] ${subColor}`}>
            {appConfig.tagline}
          </span>
        </span>
      )}
    </Link>
  );
}
