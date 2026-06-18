import {
  ArrowRight,
  ArrowLeftRight,
  BarChart3,
  Check,
  ChevronRight,
  CircleDollarSign,
  FolderTree,
  History,
  Landmark,
  Layers3,
  LockKeyhole,
  Mail,
  Menu,
  Phone,
  ReceiptText,
  Repeat2,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import {
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import {
  createElement,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router";
import BrandLogo from "../components/BrandLogo";
import SocialAuthOptions from "../components/SocialAuthOptions";
import {
  MoneyMovementPreview,
  RotatingFinancialEarth,
} from "../components/LandingPageEnhancements";
import {
  appConfig,
  appRoutes,
} from "../config/appConfig";
import { useAuth } from "../hooks/useAuth";
import { getApiErrorMessage } from "../utils/apiError";
import { registrationRegionService } from "../services/registrationRegionService";
import { accountService } from "../services/accountService";

const navigationItems = [
  {
    label: "Why ExpenseIQ",
    href: "#why-expenseiq",
  },
  {
    label: "Features",
    href: "#features",
  },
  {
    label: "How it works",
    href: "#workflow",
  },
  {
    label: "Product",
    href: "#product",
  },
  {
    label: "Security",
    href: "#security",
  },
  {
    label: "Global view",
    href: "#global-view",
  },
];

const featureCards = [
  {
    icon: WalletCards,
    title: "See every account clearly",
    description:
      "Keep cash, bank, wallet, savings and card accounts in one private workspace without mixing their balances.",
    bullets: [
      "Separate current balances",
      "Active and archived states",
      "Account-level financial history",
    ],
  },
  {
    icon: ReceiptText,
    title: "Record every money movement",
    description:
      "Capture income, expenses and transfers with the account, category, date and description that explain what happened.",
    bullets: [
      "Income and expense records",
      "Searchable transaction trail",
      "References and descriptions",
    ],
  },
  {
    icon: Repeat2,
    title: "Move money without losing the trail",
    description:
      "Transfers update both owned accounts together so the movement remains understandable from either side.",
    bullets: [
      "Atomic balance updates",
      "Safe cancellation reversal",
      "Clear source and destination",
    ],
  },
  {
    icon: FolderTree,
    title: "Organise spending your way",
    description:
      "Use protected system categories or create custom categories that match your real spending and income habits.",
    bullets: [
      "Income and expense groups",
      "Personal category colours",
      "Protected system defaults",
    ],
  },
];

const workflowSteps = [
  {
    number: "01",
    icon: Landmark,
    title: "Add the accounts you actually use",
    description:
      "Create your cash, bank, wallet, savings or card accounts with the opening balance that belongs to each one.",
  },
  {
    number: "02",
    icon: CircleDollarSign,
    title: "Record what happened",
    description:
      "Choose income, expense or transfer and connect it to the correct account and category instead of relying on memory.",
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "Let the backend protect the update",
    description:
      "Ownership and validation checks run before a record changes an account balance or becomes part of your history.",
  },
  {
    number: "04",
    icon: BarChart3,
    title: "Review the complete trail",
    description:
      "Search, filter and revisit the records that explain where money came from, where it went and which account changed.",
  },
];

const securityItems = [
  "BCrypt password protection",
  "Short-lived JWT access tokens",
  "Rotating refresh sessions",
  "Authenticated user-owned records",
  "Ownership checks on private APIs",
  "Persistent transaction history",
];

const decisionCards = [
  {
    icon: SearchCheck,
    title: "What changed my balance?",
    description:
      "Follow the transaction, date, account, category and reference that explain every confirmed balance change.",
  },
  {
    icon: Layers3,
    title: "Where is my money available?",
    description:
      "Keep bank, cash, wallet, savings and card balances separate so availability stays easy to understand.",
  },
  {
    icon: ArrowLeftRight,
    title: "Can I trace a transfer?",
    description:
      "View the source and destination together, with safe reversal when a transfer is cancelled.",
  },
  {
    icon: History,
    title: "Can I find the record later?",
    description:
      "Search and filter your history by type, status, account, category, date or description whenever context is needed.",
  },
];



const footerGroups = [
  {
    title: "Product",
    links: [
      {
        label: "Accounts",
        to: appRoutes.accounts,
      },
      {
        label: "Transactions",
        to: appRoutes.transactions,
      },
      {
        label: "Categories",
        to: appRoutes.categories,
      },
      {
        label: "Budgets",
        to: appRoutes.budgets,
      },
      {
        label: "Goals",
        to: appRoutes.goals,
      },
      {
        label: "Analytics",
        to: appRoutes.analytics,
      },
    ],
  },
  {
    title: "Explore",
    links: [
      {
        label: "Why ExpenseIQ",
        href: "#why-expenseiq",
      },
      {
        label: "Features",
        href: "#features",
      },
      {
        label: "How it works",
        href: "#workflow",
      },
      {
        label: "Product preview",
        href: "#product",
      },
      {
        label: "Security",
        href: "#security",
      },
      {
        label: "Global view",
        href: "#global-view",
      },
    ],
  },
  {
    title: "Access",
    links: [
      {
        label: "Sign in",
        to: appRoutes.login,
      },
      {
        label: "Create account",
        to: appRoutes.register,
      },
    ],
  },
];

const initialSignupForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
};

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <main className="marketing-page min-h-dvh overflow-x-hidden">
      <PublicHeader
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        closeMobileMenu={closeMobileMenu}
      />

      <HeroSection />
      <ProductStrip />
      <DecisionSection />
      <FeatureSection />
      <WorkflowSection />
      <GlobalMoneySection />
      <BlackControlSection />
      <ProductPreviewSection />
      <SecuritySection />
      <FinalCallToAction />
      <ProductFooter />
    </main>
  );
}

function PublicHeader({
  mobileMenuOpen,
  setMobileMenuOpen,
  closeMobileMenu,
}) {
  return (
    <header className="marketing-header sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="marketing-container flex h-[78px] items-center justify-between gap-5">
        <BrandLogo fixedLight />

        <nav className="hidden items-center gap-8 xl:flex">
          {navigationItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-extrabold text-slate-700 transition hover:text-[#1f55cf]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to={appRoutes.login}
            className="px-4 py-2.5 text-sm font-black text-slate-800 transition hover:text-[#1f55cf]"
          >
            Sign in
          </Link>

          <Link
            to={appRoutes.register}
            className="marketing-coral-button inline-flex h-12 items-center gap-2 rounded-xl px-6 text-sm font-black text-white"
          >
            Create account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() =>
            setMobileMenuOpen(
              (currentValue) => !currentValue,
            )
          }
          aria-label="Toggle navigation"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white lg:hidden"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-5 lg:hidden">
          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className="block rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4">
            <Link
              to={appRoutes.login}
              onClick={closeMobileMenu}
              className="flex h-11 items-center justify-center rounded-xl border border-slate-200 text-sm font-black"
            >
              Sign in
            </Link>

            <Link
              to={appRoutes.register}
              onClick={closeMobileMenu}
              className="marketing-coral-button flex h-11 items-center justify-center rounded-xl text-sm font-black text-white"
            >
              Create account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="marketing-hero marketing-inverse relative overflow-hidden bg-[#1f55cf] text-white">
      <HeroLineArt />

      <div className="marketing-container marketing-hero-grid relative z-10 grid min-w-0 items-center gap-14 py-20 sm:py-24 lg:grid-cols-[minmax(0,1.08fr)_minmax(460px,0.82fr)] lg:gap-20 lg:py-28">
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
            ease: [0.22, 1, 0.36, 1],
          }}
          className="marketing-hero-content min-w-0"
        >
          <p className="marketing-eyebrow text-blue-100">
            Personal finance management built for real life
          </p>

          <h1 className="marketing-hero-title mt-7 max-w-[720px] font-black text-white">
            Know what changed your balance.
            <span className="mt-3 block text-[#ffaaa9]">
              Decide what to do next with context.
            </span>
          </h1>

          <p className="marketing-hero-copy mt-8 max-w-[650px] text-lg text-blue-50">
            ExpenseIQ keeps every account, transaction, category and transfer
            connected, so you can see what changed, why it changed and where the
            money moved without rebuilding the story later.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <a
              href="#hero-signup"
              className="marketing-coral-button inline-flex h-13 items-center justify-center gap-2 rounded-xl px-7 text-sm font-black text-white"
            >
              Start managing your money
              <ArrowRight className="h-4 w-4" />
            </a>

            <Link
              to={appRoutes.login}
              className="inline-flex h-13 items-center justify-center rounded-xl border border-white/35 bg-white/10 px-7 text-sm font-black text-white transition hover:bg-white/15"
            >
              Open your workspace
            </Link>
          </div>

          <div className="mt-9 grid max-w-[650px] gap-3 sm:grid-cols-3">
            <TrustPoint label="Separate account balances" />
            <TrustPoint label="Traceable transfers" />
            <TrustPoint label="Private financial history" />
          </div>
        </motion.div>

        <HeroSignupForm />
      </div>
    </section>
  );
}

function HeroLineArt() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute -left-36 top-20 h-80 w-80 rounded-full border border-white/10" />
      <div className="absolute -left-12 top-44 h-52 w-52 rounded-full border border-white/8" />
      <div className="absolute bottom-[-9rem] right-[-5rem] h-[31rem] w-[31rem] rounded-full border border-white/10" />
      <div className="absolute bottom-[-4rem] right-8 h-[20rem] w-[20rem] rounded-full border border-white/8" />
      <div className="marketing-data-path absolute bottom-12 left-[7%] hidden h-24 w-[37%] lg:block" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
    </div>
  );
}

function TrustPoint({ label }) {
  return (
    <div className="flex items-center gap-2 text-sm font-bold text-blue-50">
      <Check className="h-4 w-4 shrink-0 text-[#ffaaa9]" />
      {label}
    </div>
  );
}

function HeroSignupForm() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(
    initialSignupForm,
  );
  const [submitting, setSubmitting] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

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
      const detectedRegion = await registrationRegionService.detect();

      const registrationResult = await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
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
          "Unable to create your account.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      id="hero-signup"
      initial={{
        opacity: 0,
        y: 22,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.62,
        delay: 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="marketing-signup-card scroll-mt-28 rounded-[1.8rem] bg-white p-6 text-[#0b1220] shadow-2xl shadow-blue-950/20 sm:p-8"
    >
      <p className="text-[1.55rem] font-black tracking-[-0.025em] text-[#080808]">
        Create your private workspace
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        Add the accounts you use, record real activity and keep the reason
        behind every balance change within reach.
      </p>

      {errorMessage && (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold leading-5 text-rose-700">
          {errorMessage}
        </div>
      )}


      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-3.5"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <MarketingInput
            icon={UserRound}
            name="firstName"
            value={formData.firstName}
            onChange={updateField}
            placeholder="First name"
            autoComplete="given-name"
            minLength={2}
            maxLength={100}
            required
          />

          <MarketingInput
            icon={UserRound}
            name="lastName"
            value={formData.lastName}
            onChange={updateField}
            placeholder="Last name"
            autoComplete="family-name"
            maxLength={100}
          />
        </div>

        <MarketingInput
          icon={Mail}
          name="email"
          type="email"
          value={formData.email}
          onChange={updateField}
          placeholder="Email address"
          autoComplete="email"
          maxLength={255}
          required
        />

        <MarketingInput
          icon={Phone}
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={updateField}
          placeholder="Phone number (optional)"
          autoComplete="tel"
          maxLength={20}
          pattern="[0-9+()\-\s]*"
        />

        <MarketingInput
          icon={LockKeyhole}
          name="password"
          type="password"
          value={formData.password}
          onChange={updateField}
          placeholder="Password (8-72 characters)"
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          required
        />

        <button
          type="submit"
          disabled={submitting}
          className="marketing-coral-button flex h-13 w-full items-center justify-center gap-2 rounded-xl text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting
            ? "Creating your workspace..."
            : "Create account"}
          {!submitting && (
            <ArrowRight className="h-4 w-4" />
          )}
        </button>

        <p className="text-center text-[0.7rem] leading-5 text-slate-400">
          By creating an account, you confirm that the details provided belong to you.
        </p>
      </form>

      <SocialAuthOptions />

      <p className="mt-4 text-center text-xs leading-5 text-slate-500">
        Already have an account?{" "}
        <Link
          to={appRoutes.login}
          className="font-black text-[#1f55cf]"
        >
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}

function MarketingInput({
  icon,
  ...inputProperties
}) {
  return (
    <label className="relative block">
      {createElement(icon, {
        className:
          "pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400",
        "aria-hidden": true,
      })}

      <input
        {...inputProperties}
        className="marketing-form-input h-13 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-[#0b1220] outline-none"
      />
    </label>
  );
}

function ProductStrip() {
  return (
    <section className="border-b border-slate-200 bg-white py-10">
      <div className="marketing-container grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Accounts", "Know exactly where money is available"],
          ["Transactions", "See what changed each balance and why"],
          ["Categories", "Keep income and spending easy to review"],
          ["Security", "Access only the records owned by your account"],
        ].map(([title, description], index) => (
          <Reveal
            key={title}
            direction={index % 2 === 0 ? "left" : "right"}
            delay={index * 0.05}
          >
            <StripItem title={title} description={description} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function StripItem({
  title,
  description,
}) {
  return (
    <div className="marketing-strip-item rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-lg font-black text-[#0b1220]">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function DecisionSection() {
  return (
    <section
      id="why-expenseiq"
      className="marketing-section bg-[#f8fafc]"
    >
      <div className="marketing-container grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
        <Reveal direction="left">
          <div className="decision-section-copy">
            <p className="marketing-eyebrow text-[#1f55cf]">
              Clarity that supports real decisions
            </p>

            <h2 className="mt-5 text-4xl leading-tight sm:text-5xl">
              The answers you need should be visible without reconstructing the story.
            </h2>

            <p className="mt-6 max-w-xl text-base leading-8">
              ExpenseIQ connects balances to the records that created them. When
              a number changes, the account, transaction type, category and date
              remain available so the next decision is based on context instead
              of memory.
            </p>

            <div className="decision-callout mt-8 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
              <p className="font-black text-[#0b1220]">
                Designed for everyday financial control
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Start with one account or several. The workspace stays useful as
                your records grow because every activity remains connected to its
                source.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2">
          {decisionCards.map((card, index) => (
            <Reveal
              key={card.title}
              direction={index % 2 === 0 ? "right" : "left"}
              delay={index * 0.06}
            >
              <article className="decision-card h-full rounded-[1.4rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#1f55cf]">
                  {createElement(card.icon, {
                    className: "h-5 w-5",
                    "aria-hidden": true,
                  })}
                </div>
                <h3 className="mt-5 text-xl">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  {card.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureSection() {
  return (
    <section
      id="features"
      className="marketing-section bg-white"
    >
      <div className="marketing-container">
        <SectionHeading
          eyebrow="The complete personal-finance workspace"
          title="A clearer way to manage everyday money"
          description="Stop switching between memory, notes and disconnected balances. Keep the records that explain your financial activity in one consistent place."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {featureCards.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              direction={index % 2 === 0 ? "left" : "right"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  direction,
}) {
  return (
    <Reveal direction={direction}>
      <article className="marketing-card h-full p-8 transition hover:-translate-y-1 hover:shadow-xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1f55cf]">
          {createElement(feature.icon, {
            className: "h-5 w-5",
            "aria-hidden": true,
          })}
        </div>

        <h3 className="mt-6 text-2xl">
          {feature.title}
        </h3>

        <p className="mt-3 text-base leading-7">
          {feature.description}
        </p>

        <div className="mt-6 space-y-3">
          {feature.bullets.map((bullet) => (
            <div
              key={bullet}
              className="flex items-center gap-3 text-sm font-bold text-slate-700"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-[#1f55cf]">
                <Check className="h-3.5 w-3.5" />
              </span>
              {bullet}
            </div>
          ))}
        </div>
      </article>
    </Reveal>
  );
}

function WorkflowSection() {
  return (
    <section
      id="workflow"
      className="marketing-section relative overflow-hidden bg-[#fff7f5]"
    >
      <div className="workflow-dot-grid pointer-events-none absolute inset-0" />

      <div className="marketing-container relative z-10 grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <Reveal direction="left">
            <div>
          <p className="marketing-eyebrow text-[#ff5156]">
            From entry to understanding
          </p>

          <h2 className="mt-5 text-4xl leading-tight sm:text-5xl">
            A simple path from money movement to a clear record
          </h2>

          <p className="mt-6 max-w-xl text-base leading-8">
            Every step stays connected. Add the account, record the movement,
            let the secured backend apply the change, and return later to a
            history that still explains what happened.
          </p>

          <div className="mt-8 space-y-4">
            <WorkflowBenefit
              text="No separate spreadsheets to reconcile"
            />
            <WorkflowBenefit
              text="No guessed balances between accounts"
            />
            <WorkflowBenefit
              text="No broken trail after a transfer or cancellation"
            />
          </div>
            </div>
          </Reveal>
        </div>

        <div className="relative space-y-5">
          <div className="workflow-connector absolute bottom-8 left-6 top-8 hidden w-px sm:block" />

          {workflowSteps.map((step, index) => (
            <WorkflowCard
              key={step.number}
              step={step}
              direction={index % 2 === 0 ? "right" : "left"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkflowBenefit({
  text,
}) {
  return (
    <div className="flex items-center gap-3 text-sm font-bold text-slate-700">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#ff5156] shadow-sm">
        <Check className="h-4 w-4" />
      </span>
      {text}
    </div>
  );
}

function WorkflowCard({
  step,
  direction,
}) {
  return (
    <Reveal direction={direction}>
      <article className="marketing-card relative flex gap-5 p-7 sm:ml-8">
        <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#1f55cf]">
          {createElement(step.icon, {
            className: "h-5 w-5",
            "aria-hidden": true,
          })}
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff5156]">
            Step {step.number}
          </p>

          <h3 className="mt-2 text-2xl">
            {step.title}
          </h3>

          <p className="mt-3 text-base leading-7">
            {step.description}
          </p>
        </div>
      </article>
    </Reveal>
  );
}

function GlobalMoneySection() {
  return (
    <section
      id="global-view"
      className="marketing-section overflow-hidden bg-white"
    >
      <div className="marketing-container grid gap-16 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-center xl:gap-20">
        <Reveal direction="left">
          <MoneyGlobe />
        </Reveal>

        <Reveal direction="right">
          <div className="global-money-copy">
            <p className="marketing-eyebrow text-[#1f55cf]">
              Your financial world, connected
            </p>

            <h2 className="mt-5 text-4xl leading-tight sm:text-5xl">
              One clear view across every account you manage.
            </h2>

            <p className="mt-6 text-base leading-8">
              Keep cash, bank accounts, cards and digital wallets separate while
              still understanding how money moves between them. ExpenseIQ gives
              every transaction a clear place, purpose and history.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <GlobalBenefit
                icon={WalletCards}
                title="Separate account views"
                description="Understand where money is available without merging unrelated balances."
              />
              <GlobalBenefit
                icon={Repeat2}
                title="Connected transfers"
                description="See the source and destination sides of the same movement together."
              />
              <GlobalBenefit
                icon={FolderTree}
                title="Consistent categories"
                description="Organise income and spending with a structure that remains easy to review."
              />
              <GlobalBenefit
                icon={ShieldCheck}
                title="Private by default"
                description="Financial records are returned only for the authenticated account owner."
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function MoneyGlobe() {
  return <RotatingFinancialEarth />;
}

function GlobalBenefit({
  icon,
  title,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#1f55cf] shadow-sm">
        {createElement(icon, {
          className: "h-4.5 w-4.5",
          "aria-hidden": true,
        })}
      </div>
      <p className="mt-4 font-black text-[#0b1220]">
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function BlackControlSection() {
  return (
    <section className="bg-white py-12">
      <div className="marketing-dark-panel marketing-inverse marketing-container overflow-hidden rounded-[2rem] bg-[#090909] px-8 py-12 text-white sm:px-12 lg:px-16">
        <div className="relative z-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal direction="left">
            <div>
              <p className="marketing-eyebrow text-[#ffaaa9]">
                Context behind every balance
              </p>

              <h2 className="mt-5 text-4xl leading-tight text-white sm:text-5xl">
                Understand the change, not just the final number.
              </h2>

              <p className="mt-6 max-w-xl text-base leading-8 text-slate-300">
                Each confirmed record keeps its account, type, category, date and
                description connected. You can return later and still understand
                what moved, where it moved and how the balance was affected.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {["Account ownership enforced", "Transfers preserve both sides", "Cancellations reverse safely", "History remains searchable"].map((label, index) => (
              <Reveal
                key={label}
                direction={index % 2 === 0 ? "right" : "left"}
                delay={index * 0.05}
              >
                <BlackPoint label={label} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BlackPoint({
  label,
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-5">
      <Check className="h-5 w-5 text-[#ffaaa9]" />
      <p className="mt-4 text-sm font-black leading-6 text-white">
        {label}
      </p>
    </div>
  );
}

function ProductPreviewSection() {
  return (
    <section
      id="product"
      className="marketing-section bg-[#f8fafc]"
    >
      <div className="marketing-container">
        <SectionHeading
          eyebrow="See the product working"
          title="A workspace that grows from your own records"
          description="The previews show how your own accounts and transactions are organised. Amounts remain yours and appear only after you add real activity."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <AccountPreview />
          <TransactionFlowPreview />
        </div>
      </div>
    </section>
  );
}

function formatAccountBalance(value, currencyCode) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "Balance unavailable";
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode || "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericValue);
  } catch {
    return `${currencyCode || "INR"} ${numericValue.toFixed(2)}`;
  }
}

function AccountPreview() {
  const { isAuthenticated } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(isAuthenticated);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    let cancelled = false;

    accountService
      .getAccounts(true)
      .then((result) => {
        if (!cancelled) {
          setAccounts(Array.isArray(result) ? result : []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadFailed(true);
          setAccounts([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const visibleAccounts = accounts.slice(0, 3);

  return (
    <Reveal direction="left">
      <div className="marketing-card h-full p-7">
        <div className="flex items-center justify-between border-b border-slate-200 pb-5">
          <div>
            <h3 className="text-2xl">
              Accounts overview
            </h3>
            <p className="mt-2 text-sm">
              {isAuthenticated
                ? "Live balances from your authenticated workspace."
                : "Your account data appears here only after you sign in."}
            </p>
          </div>
          <WalletCards className="h-7 w-7 text-[#1f55cf]" />
        </div>

        <div className="mt-6">
          {loading && (
            <div className="grid gap-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-[74px] animate-pulse rounded-2xl border border-slate-200 bg-slate-50"
                />
              ))}
            </div>
          )}

          {!loading && loadFailed && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm leading-6 text-rose-700">
              Account data could not be loaded. Open the secured workspace and
              refresh after confirming the backend is running.
            </div>
          )}

          {!loading && !loadFailed && !isAuthenticated && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-lg font-black text-[#0b1220]">
                No public account data is displayed.
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Sign in to load the account names, currencies and current
                balances that belong to your authenticated profile.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to={appRoutes.login}
                  className="marketing-coral-button inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-black text-white"
                >
                  Sign in
                </Link>
                <Link
                  to={appRoutes.register}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-black text-[#0b1220]"
                >
                  Create account
                </Link>
              </div>
            </div>
          )}

          {!loading &&
            !loadFailed &&
            isAuthenticated &&
            visibleAccounts.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-lg font-black text-[#0b1220]">
                  No active accounts yet
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Add the first account you actually use. ExpenseIQ will then
                  show its real current balance here.
                </p>
                <Link
                  to={appRoutes.accounts}
                  className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#1f55cf] px-5 text-sm font-black text-white"
                >
                  Add an account
                </Link>
              </div>
            )}

          {!loading &&
            !loadFailed &&
            visibleAccounts.length > 0 && (
              <div className="grid gap-4">
                {visibleAccounts.map((account) => (
                  <PreviewRow
                    key={account.publicId}
                    label={account.name}
                    value={formatAccountBalance(
                      account.currentBalance,
                      account.currencyCode,
                    )}
                  />
                ))}
              </div>
            )}
        </div>

        <div className="mt-6 rounded-2xl bg-blue-50 p-5">
          <p className="text-sm font-black text-[#1f55cf]">
            Every value comes from your secured records.
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Account names and balances are never invented for the landing page.
            Anonymous visitors see a private empty state; signed-in users see
            only their own active accounts.
          </p>
        </div>
      </div>
    </Reveal>
  );
}

function TransactionFlowPreview() {
  return (
    <Reveal direction="right">
      <MoneyMovementPreview />
    </Reveal>
  );
}

function PreviewRow({
  label,
  value,
}) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-black text-[#0b1220]">
        {label}
      </span>
      <span className="text-sm font-bold text-slate-500">
        {value}
      </span>
    </div>
  );
}

function SecuritySection() {
  return (
    <section
      id="security"
      className="marketing-section bg-white"
    >
      <div className="marketing-container grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <Reveal direction="left">
          <div>
          <p className="marketing-eyebrow text-[#1f55cf]">
            Security from the beginning
          </p>

          <h2 className="mt-5 text-4xl leading-tight sm:text-5xl">
            Private financial records deserve serious access control.
          </h2>

          <p className="mt-6 text-base leading-8">
            ExpenseIQ keeps accounts, categories and transactions scoped to
            the authenticated user. Access, refresh and ownership checks happen
            before private records are returned.
          </p>

          <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5">
            <div className="flex min-w-0 items-start gap-4">
              <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-[#1f55cf]" />
              <div>
                <p className="font-black text-[#0b1220]">
                  Your records remain yours
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  The interface requests only the data associated with the
                  signed-in account instead of exposing a shared financial
                  dataset.
                </p>
              </div>
            </div>
          </div>
          </div>
        </Reveal>

        <Reveal direction="right">
          <div className="marketing-card p-7">
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1f55cf]">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <h3 className="text-2xl">
                Protection checklist
              </h3>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {securityItems.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1f55cf]" />
                  <p className="text-sm font-bold leading-6 text-slate-700">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FinalCallToAction() {
  return (
    <section className="bg-[#fff7f5] py-20">
      <Reveal direction="up">
      <div className="marketing-inverse marketing-container relative overflow-hidden rounded-[2rem] bg-[#1f55cf] px-8 py-12 text-white shadow-2xl shadow-blue-600/20 sm:px-12 lg:flex lg:items-center lg:justify-between">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -bottom-20 right-32 h-48 w-48 rounded-full border border-white/10" />

        <div className="relative z-10">
          <p className="marketing-eyebrow text-blue-100">
            Stop guessing. Start seeing.
          </p>

          <h2 className="mt-4 max-w-3xl text-4xl leading-tight text-white">
            Build a money history that helps tomorrow's decisions make more
            sense.
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-8 text-blue-100">
            Start with the accounts you use, record what happens, and return to
            a workspace that keeps every balance change connected to its reason.
          </p>
        </div>

        <Link
          to={appRoutes.register}
          className="marketing-coral-button relative z-10 mt-8 inline-flex h-12 shrink-0 items-center gap-2 rounded-xl px-7 text-sm font-black text-white lg:mt-0"
        >
          Create your workspace
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      </Reveal>
    </section>
  );
}

function ProductFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="marketing-footer border-t-4 border-[#ff5156] bg-[linear-gradient(135deg,#1748b5_0%,#123b8f_52%,#0c2d72_100%)] text-white">
      <div className="marketing-container py-14">
        <div className="grid gap-10 lg:grid-cols-[1.25fr_1.6fr]">
          <div>
            <BrandLogo light />
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              {appConfig.appName} connects each account balance to the records
              that changed it, giving you one private place to understand money
              movement, categories and financial history.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black text-slate-200">
              <Sparkles className="h-4 w-4 text-[#ff5156]" />
              {appConfig.tagline}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <FooterGroup
                key={group.title}
                group={group}
              />
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {currentYear} {appConfig.appName}. All rights reserved.
          </p>
          <p>
            You control the financial records added to your workspace.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({
  group,
}) {
  return (
    <div>
      <h3 className="text-sm font-black text-white">
        {group.title}
      </h3>

      <div className="mt-4 space-y-3">
        {group.links.map((link) =>
          link.to ? (
            <Link
              key={link.label}
              to={link.to}
              className="block text-sm font-semibold text-slate-300 transition hover:text-[#ffaaa9]"
            >
              {link.label}
            </Link>
          ) : (
            <a
              key={link.label}
              href={link.href}
              className="block text-sm font-semibold text-slate-300 transition hover:text-[#ffaaa9]"
            >
              {link.label}
            </a>
          ),
        )}
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}) {
  return (
    <Reveal direction="up">
      <div className="mx-auto max-w-3xl text-center">
        <p className="marketing-eyebrow text-[#1f55cf]">
          {eyebrow}
        </p>

        <h2 className="mt-4 text-4xl leading-tight sm:text-5xl">
          {title}
        </h2>

        <p className="mt-6 text-base leading-8">
          {description}
        </p>
      </div>
    </Reveal>
  );
}

function Reveal({
  children,
  direction = "up",
  delay = 0,
}) {
  const reduceMotion = useReducedMotion();
  const reference = useRef(null);
  const visible = useInView(reference, {
    amount: 0.18,
    margin: "-8% 0px -8% 0px",
  });

  const hiddenPosition =
    direction === "left"
      ? { x: -56, y: 0 }
      : direction === "right"
        ? { x: 56, y: 0 }
        : { x: 0, y: 28 };

  const hiddenState = {
    opacity: 0,
    ...hiddenPosition,
    scale: 0.985,
  };

  const visibleState = {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
  };

  return (
    <motion.div
      ref={reference}
      initial={false}
      animate={
        reduceMotion || visible
          ? visibleState
          : hiddenState
      }
      transition={{
        duration: reduceMotion ? 0 : 0.66,
        delay: reduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="reveal-shell"
    >
      {children}
    </motion.div>
  );
}

