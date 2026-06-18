import {
  ArrowRight,
  Construction,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router";
import { appRoutes } from "../config/appConfig";

export default function ComingSoonPage({
  title,
  description,
}) {
  return (
    <div
      className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10 overflow-x-hidden"
      style={{
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <section className="relative overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.055)] dark:border-slate-800 dark:bg-[#101a2c]">
        <div className="absolute inset-x-0 top-0 h-1 bg-[#1f55cf]" />

        <div className="grid min-h-[480px] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300">
              <Construction className="h-6 w-6" />
            </div>

            <p className="mt-7 text-[0.7rem] font-extrabold uppercase tracking-[0.18em] text-[#1f55cf] dark:text-blue-300">
              Product module
            </p>

            <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-[#080808] dark:text-white sm:text-[2.35rem]">
              {title}
            </h1>

            <p className="mt-5 max-w-xl text-[0.95rem] leading-7 text-slate-600 dark:text-slate-400">
              {description}
            </p>

            <Link
              to={appRoutes.workspace}
              className="mt-8 inline-flex h-12 w-fit items-center justify-center gap-2 rounded-xl bg-[#1f55cf] px-6 text-sm font-extrabold text-white shadow-[0_10px_22px_rgba(31,85,207,0.2)] transition hover:bg-[#1848b5]"
            >
              Return to dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="border-t border-slate-200 bg-[#f8fafc] p-8 dark:border-slate-800 dark:bg-[#0b1424] sm:p-12 lg:border-l lg:border-t-0">
            <div className="flex h-full flex-col justify-center">
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                <Sparkles className="h-5 w-5 text-[#ff5156]" />

                <p className="text-sm font-extrabold text-[#0b1220] dark:text-white">
                  Production implementation approach
                </p>
              </div>

              <div className="mt-7 space-y-4">
                <RoadmapItem
                  number="01"
                  text="Backend entities, validation, ownership, and database migration"
                />

                <RoadmapItem
                  number="02"
                  text="Secured APIs connected to authenticated user records"
                />

                <RoadmapItem
                  number="03"
                  text="Real-data interface, empty states, testing, and verification"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function RoadmapItem({
  number,
  text,
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-[#101a2c]">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-extrabold text-[#1f55cf] dark:bg-blue-500/10 dark:text-blue-300">
        {number}
      </span>

      <p className="pt-1 text-sm font-semibold leading-6 text-slate-600 dark:text-slate-300">
        {text}
      </p>
    </div>
  );
}