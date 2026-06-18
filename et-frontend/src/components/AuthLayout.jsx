import {
    BarChart3,
    BrainCircuit,
    Moon,
    PiggyBank,
    ReceiptText,
    ScanLine,
    ShieldCheck,
    Sun,
  } from "lucide-react";
  import {
    motion,
    useReducedMotion,
  } from "framer-motion";
  import BrandLogo from "./BrandLogo";
  import { useTheme } from "../hooks/useTheme";
  
  const authFlowItems = [
    {
      icon: ReceiptText,
      title: "Capture",
      description: "Manual transaction entry",
    },
    {
      icon: BrainCircuit,
      title: "Understand",
      description: "Category-based records",
    },
    {
      icon: PiggyBank,
      title: "Protect",
      description: "Accounts and transfers",
    },
    {
      icon: BarChart3,
      title: "Improve",
      description: "History from real records",
    },
  ];
  
  const orbitItems = [
    {
      icon: ReceiptText,
      label: "Expense capture",
    },
    {
      icon: BrainCircuit,
      label: "Category records",
    },
    {
      icon: PiggyBank,
      label: "Account balances",
    },
    {
      icon: BarChart3,
      label: "Transaction history",
    },
  ];
  
  const orbitPositions = [
    "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2",
    "right-0 top-1/2 translate-x-1/2 -translate-y-1/2",
    "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
    "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2",
  ];
  
  export default function AuthLayout({
    title,
    description,
    children,
    footer,
  }) {
    const { theme, toggleTheme } = useTheme();
    const reduceMotion = useReducedMotion();
  
    return (
      <main className="relative min-h-dvh overflow-hidden bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
        <ThemeToggle
          theme={theme}
          toggleTheme={toggleTheme}
          reduceMotion={reduceMotion}
        />
  
        <div className="grid min-h-dvh lg:grid-cols-[0.94fr_1.06fr]">
          <BrandPanel
            reduceMotion={reduceMotion}
          />
  
          <section className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-4 py-4 sm:px-7 sm:py-5 lg:px-10 lg:py-3">
            <RightPanelBackground
              reduceMotion={reduceMotion}
            />
  
            <TechnologyOrbit
              reduceMotion={reduceMotion}
            />
  
            <motion.div
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 20,
                      scale: 0.985,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              transition={{
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative z-20 w-full max-w-[430px]"
            >
              <MobileBrand />
  
              <div className="auth-glass-card relative overflow-hidden rounded-[1.75rem] p-5 sm:p-6">
                <CardLightSweep
                  reduceMotion={reduceMotion}
                />
  
                <div className="relative z-10">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-50" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.65)]" />
                    </span>
  
                    <span className="text-[0.7rem] font-black uppercase tracking-[0.17em] text-[#2457d6] dark:text-cyan-300">
                      Secure access
                    </span>
                  </div>
  
                  <h2 className="mt-3 text-[1.75rem] font-black leading-tight tracking-tight sm:text-3xl">
                    {title}
                  </h2>
  
                  <p className="mt-2 max-w-sm text-sm leading-5 text-slate-500 dark:text-slate-400">
                    {description}
                  </p>
  
                  <div className="mt-5">
                    {children}
                  </div>
                </div>
              </div>
  
              <div className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400">
                {footer}
              </div>
  
              <MobileProcessStrip />
            </motion.div>
          </section>
        </div>
      </main>
    );
  }
  
  function BrandPanel({
    reduceMotion,
  }) {
    return (
      <section className="relative hidden min-h-dvh overflow-hidden bg-[#1f55cc] px-9 py-7 text-white lg:grid lg:grid-rows-[auto_1fr_auto] xl:px-12">
        <AuthPanelBackground
          reduceMotion={reduceMotion}
        />
  
<BrandLogo light className="relative z-10" />
  
        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  x: -24,
                }
          }
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.6,
          }}
          className="relative z-10 my-auto max-w-xl py-6"
        >
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[0.68rem] font-black uppercase tracking-[0.16em] text-blue-100">
            Real data. Clear decisions.
          </span>
  
          <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight xl:text-[2.8rem]">
            A secure path from every expense to
  
            <span className="mt-1 block text-[#ffaaa9]">
              meaningful insight.
            </span>
          </h1>
  
          <p className="mt-4 max-w-lg text-sm leading-6 text-blue-100 xl:text-base xl:leading-7">
            Accounts, categories and transactions remain
            connected through secured backend APIs.
          </p>
  
          <div className="mt-6 grid grid-cols-2 gap-3">
            {authFlowItems.map(
              (
                {
                  icon: Icon,
                  title: itemTitle,
                  description: itemDescription,
                },
                index,
              ) => (
                <motion.div
                  key={itemTitle}
                  initial={
                    reduceMotion
                      ? false
                      : {
                          opacity: 0,
                          y: 12,
                        }
                  }
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.2 + index * 0.08,
                    duration: 0.35,
                  }}
                  whileHover={
                    reduceMotion
                      ? undefined
                      : {
                          y: -3,
                        }
                  }
                  className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm"
                >
                  <Icon className="h-4.5 w-4.5 text-cyan-200" />
  
                  <p className="mt-3 text-sm font-black">
                    {itemTitle}
                  </p>
  
                  <p className="mt-1 text-[0.68rem] leading-4 text-blue-200">
                    {itemDescription}
                  </p>
                </motion.div>
              ),
            )}
          </div>
        </motion.div>
  
        <div className="relative z-10 flex items-center gap-2 text-[0.68rem] text-blue-200">
          <ShieldCheck className="h-4 w-4 text-cyan-200" />
          JWT, BCrypt and rotating session security
        </div>
      </section>
    );
  }
  
  function TechnologyOrbit({
    reduceMotion,
  }) {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 hidden h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 xl:block"
      >
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  rotate: 360,
                }
          }
          transition={{
            duration: 32,
            repeat: Infinity,
            ease: "linear",
          }}
          className="relative h-full w-full rounded-full border border-blue-300/30 dark:border-blue-400/15"
        >
          {orbitItems.map(
            (
              {
                icon: Icon,
                label,
              },
              index,
            ) => (
              <div
                key={label}
                className={`absolute ${orbitPositions[index]}`}
              >
                <motion.div
                  animate={
                    reduceMotion
                      ? undefined
                      : {
                          rotate: -360,
                        }
                  }
                  transition={{
                    duration: 32,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  title={label}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/80 bg-white/90 text-[#2457d6] shadow-[0_14px_38px_-14px_rgba(36,87,214,0.5)] backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/90 dark:text-cyan-300"
                >
                  <Icon className="h-5 w-5" />
                </motion.div>
              </div>
            ),
          )}
        </motion.div>
  
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  rotate: -360,
                }
          }
          transition={{
            duration: 21,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-[4.5rem] rounded-full border border-dashed border-cyan-300/40 dark:border-cyan-400/15"
        >
          <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.7)]" />
  
          <span className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-blue-500 shadow-[0_0_18px_rgba(36,87,214,0.65)]" />
        </motion.div>
  
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  scale: [0.94, 1.04, 0.94],
                  opacity: [0.25, 0.55, 0.25],
                }
          }
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-[7.5rem] rounded-full bg-blue-300/20 blur-3xl dark:bg-blue-500/10"
        />
      </div>
    );
  }
  
  function RightPanelBackground({
    reduceMotion,
  }) {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [0, 60, 0],
                  y: [0, 30, 0],
                }
          }
          transition={{
            duration: 17,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-blue-200/35 blur-3xl dark:bg-blue-500/10"
        />
  
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [0, -40, 0],
                  y: [0, -30, 0],
                }
          }
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-36 -left-20 h-80 w-80 rounded-full bg-cyan-200/25 blur-3xl dark:bg-cyan-500/8"
        />
  
        <div className="absolute inset-0 bg-[linear-gradient(rgba(36,87,214,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(36,87,214,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>
    );
  }
  
  function MobileBrand() {
    return (
<BrandLogo className="mb-4 lg:hidden" />
    );
  }
  
  function MobileProcessStrip() {
    return (
      <div className="mt-4 grid grid-cols-4 gap-2 xl:hidden">
        {orbitItems.map(
          ({
            icon: Icon,
            label,
          }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-100 bg-white/80 text-[#2457d6] shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-cyan-300">
                <Icon className="h-3.5 w-3.5" />
              </div>
  
              <span className="sr-only">
                {label}
              </span>
            </div>
          ),
        )}
      </div>
    );
  }
  
  function ThemeToggle({
    theme,
    toggleTheme,
    reduceMotion,
  }) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/90 text-slate-600 shadow-lg backdrop-blur transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200"
      >
        <motion.span
          key={theme}
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  rotate: -70,
                  scale: 0.75,
                }
          }
          animate={{
            opacity: 1,
            rotate: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.22,
          }}
        >
          {theme === "dark" ? (
            <Sun className="h-4.5 w-4.5" />
          ) : (
            <Moon className="h-4.5 w-4.5" />
          )}
        </motion.span>
      </button>
    );
  }
  
  function CardLightSweep({
    reduceMotion,
  }) {
    return (
      <motion.div
        aria-hidden="true"
        animate={
          reduceMotion
            ? undefined
            : {
                x: ["-180%", "300%"],
              }
        }
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatDelay: 3,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -top-24 h-72 w-14 rotate-12 bg-gradient-to-b from-transparent via-white/55 to-transparent blur-xl dark:via-white/10"
      />
    );
  }
  
  function AuthPanelBackground({
    reduceMotion,
  }) {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:44px_44px] opacity-40" />
  
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  x: [0, 70, 0],
                  y: [0, -35, 0],
                  rotate: [0, 8, 0],
                }
          }
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-20 -right-28 h-80 w-80 rounded-[4rem] border border-white/10"
        />
  
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, 28, 0],
                }
          }
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-24 top-24 h-60 w-60 rounded-full border border-white/10"
        />
  
        <motion.div
          animate={
            reduceMotion
              ? undefined
              : {
                  rotate: 360,
                }
          }
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute right-14 top-20 h-24 w-24 rounded-full border border-dashed border-cyan-200/20"
        >
          <ScanLine className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-cyan-200/70" />
        </motion.div>
      </div>
    );
  }