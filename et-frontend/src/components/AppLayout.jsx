import {
    AnimatePresence,
    motion,
  } from "framer-motion";
  import {
    BarChart3,
    CircleDollarSign,
    FileText,
    FolderTree,
    Goal,
    LayoutDashboard,
    LogOut,
    Menu,
    Moon,
    PiggyBank,
    Settings,
    Sun,
    WalletCards,
    X,
  } from "lucide-react";
  import { useState } from "react";
  import {
    NavLink,
    Outlet,
    useLocation,
    useNavigate,
  } from "react-router";
  import { appRoutes } from "../config/appConfig";
  import BrandLogo from "./BrandLogo";
  import NotificationBell from "./NotificationBell";
  import { useAuth } from "../hooks/useAuth";
  import { useTheme } from "../hooks/useTheme";
  
  const navigationItems = [
    {
      label: "Dashboard",
      path: appRoutes.dashboard,
      icon: LayoutDashboard,
    },
    {
      label: "Accounts",
      path: appRoutes.accounts,
      icon: WalletCards,
    },
    {
      label: "Transactions",
      path: appRoutes.transactions,
      icon: CircleDollarSign,
    },
    {
      label: "Categories",
      path: appRoutes.categories,
      icon: FolderTree,
    },
    {
      label: "Budgets",
      path: appRoutes.budgets,
      icon: PiggyBank,
    },
    {
      label: "Goals",
      path: appRoutes.goals,
      icon: Goal,
    },
    {
      label: "Analytics",
      path: appRoutes.analytics,
      icon: BarChart3,
    },
    {
      label: "Reports",
      path: appRoutes.reports,
      icon: FileText,
    },
    {
      label: "Settings",
      path: appRoutes.settings,
      icon: Settings,
    },
  ];
  
  function getPageTitle(pathname) {
    const matchedItem = navigationItems.find(
      (item) => item.path === pathname,
    );
  
    return matchedItem?.label ?? "Workspace";
  }
  
  function getInitials(user) {
    const firstInitial =
      user?.firstName?.trim()?.charAt(0) ?? "";
  
    const lastInitial =
      user?.lastName?.trim()?.charAt(0) ?? "";
  
    return (
      `${firstInitial}${lastInitial}`.toUpperCase() ||
      "U"
    );
  }
  
  export default function AppLayout() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
  
    const navigate = useNavigate();
    const location = useLocation();
  
    const [mobileMenuOpen, setMobileMenuOpen] =
      useState(false);
  
    async function handleLogout() {
      await logout();
      navigate(appRoutes.root, {
        replace: true,
      });
    }
  
    function closeMobileMenu() {
      setMobileMenuOpen(false);
    }
  
    const pageTitle = getPageTitle(
      location.pathname,
    );
  
    return (
      <div className="expenseiq-app-shell min-h-dvh bg-[#f5f7fb] text-slate-950 dark:bg-[#070b14] dark:text-white">
        <DesktopSidebar
          user={user}
          onLogout={handleLogout}
        />
  
        <AnimatePresence>
          {mobileMenuOpen && (
            <MobileSidebar
              user={user}
              onClose={closeMobileMenu}
              onLogout={handleLogout}
            />
          )}
        </AnimatePresence>
  
        <div className="min-h-dvh lg:pl-72">
          <header className="expenseiq-app-topbar sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-[#0b1220]/85">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setMobileMenuOpen(true)
                  }
                  aria-label="Open navigation"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white lg:hidden dark:border-slate-700 dark:bg-slate-900"
                >
                  <Menu className="h-5 w-5" />
                </button>
  
                <div>
                  <p className="text-lg font-black">
                    {pageTitle}
                  </p>
  
                  <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">
                    Manage your real financial records
                  </p>
                </div>
              </div>
  
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <NotificationBell />

                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900"
                >
                  {theme === "dark" ? (
                    <Sun className="h-4.5 w-4.5" />
                  ) : (
                    <Moon className="h-4.5 w-4.5" />
                  )}
                </button>
  
                <div className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 sm:flex dark:border-slate-700 dark:bg-slate-900">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2457d6] text-xs font-black text-white">
                    {getInitials(user)}
                  </div>
  
                  <div className="max-w-40">
                    <p className="truncate text-xs font-bold">
                      {user?.firstName}{" "}
                      {user?.lastName}
                    </p>
  
                    <p className="truncate text-[0.65rem] text-slate-500 dark:text-slate-400">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>
  
          <main className="expenseiq-app-main px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }
  
  function DesktopSidebar({
    user,
    onLogout,
  }) {
    return (
      <aside className="expenseiq-sidebar fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-white/10 bg-[#071426] text-white lg:flex">
        <SidebarContent
          user={user}
          onLogout={onLogout}
        />
      </aside>
    );
  }
  
  function MobileSidebar({
    user,
    onClose,
    onLogout,
  }) {
    return (
      <div className="fixed inset-0 z-50 lg:hidden">
        <motion.button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        />
  
        <motion.aside
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{
            duration: 0.25,
            ease: "easeOut",
          }}
          className="relative z-10 flex h-full w-[85%] max-w-72 flex-col bg-[#071426] text-white shadow-2xl"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5"
          >
            <X className="h-4.5 w-4.5" />
          </button>
  
          <SidebarContent
            user={user}
            onNavigate={onClose}
            onLogout={onLogout}
          />
        </motion.aside>
      </div>
    );
  }
  
  function SidebarContent({
    user,
    onNavigate,
    onLogout,
  }) {
    return (
      <>
        <div className="px-6 py-6">
          <BrandLogo light />
        </div>
  
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-3">
          {navigationItems.map(
            ({
              label,
              path,
              icon: Icon,
            }) => (
              <NavLink
                key={path}
                to={path}
                onClick={onNavigate}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition",
                    isActive
                      ? "bg-white text-[#1748bd] shadow-lg shadow-black/10"
                      : "text-slate-300 hover:bg-white/8 hover:text-white",
                  ].join(" ")
                }
              >
                <Icon className="h-4.5 w-4.5" />
                {label}
              </NavLink>
            ),
          )}
        </nav>
  
        <div className="border-t border-white/10 p-4">
          <div className="mb-3 rounded-2xl bg-white/5 p-3">
            <p className="truncate text-xs font-bold">
              {user?.firstName} {user?.lastName}
            </p>
  
            <p className="mt-1 truncate text-[0.65rem] text-slate-400">
              {user?.email}
            </p>
          </div>
  
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-rose-500/10 hover:text-rose-300"
          >
            <LogOut className="h-4.5 w-4.5" />
            Sign out
          </button>
        </div>
      </>
    );
  }