import {
  lazy,
  Suspense,
} from "react";
import {
  Navigate,
  Route,
  Routes,
} from "react-router";

import {
  ProtectedRoute,
  PublicRoute,
} from "./components/RouteGuards";
import { appRoutes } from "./config/appConfig";

const AppLayout = lazy(() =>
  import("./components/AppLayout"),
);

const AccountsPage = lazy(() =>
  import("./pages/AccountsPage"),
);

const AnalyticsPage = lazy(() =>
  import("./pages/AnalyticsPage"),
);

const BudgetsPage = lazy(() =>
  import("./pages/BudgetsPage"),
);

const CategoriesPage = lazy(() =>
  import("./pages/CategoriesPage"),
);

const DashboardPage = lazy(() =>
  import("./pages/DashboardPage"),
);

const GoalsPage = lazy(() =>
  import("./pages/GoalsPage"),
);

const LandingPage = lazy(() =>
  import("./pages/LandingPage"),
);

const LoginPage = lazy(() =>
  import("./pages/LoginPage"),
);

const OAuthCallbackPage = lazy(() =>
  import("./pages/OAuthCallbackPage"),
);

const RegisterPage = lazy(() =>
  import("./pages/RegisterPage"),
);

const ReportsPage = lazy(() =>
  import("./pages/ReportsPage"),
);

const SettingsPage = lazy(() =>
  import("./pages/SettingsPage"),
);

const TransactionsPage = lazy(() =>
  import("./pages/TransactionsPage"),
);

export default function App() {
  return (
    <Suspense
      fallback={<RouteLoadingScreen />}
    >
      <Routes>
        <Route
          path={appRoutes.root}
          element={<LandingPage />}
        />

        <Route element={<PublicRoute />}>
          <Route
            path={appRoutes.login}
            element={<LoginPage />}
          />

          <Route
            path={appRoutes.register}
            element={<RegisterPage />}
          />

          <Route
            path={
              appRoutes.oauthCallback
            }
            element={
              <OAuthCallbackPage />
            }
          />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route
            path={appRoutes.workspace}
            element={<AppLayout />}
          >
            <Route
              index
              element={
                <Navigate
                  to="dashboard"
                  replace
                />
              }
            />

            <Route
              path="dashboard"
              element={<DashboardPage />}
            />

            <Route
              path="accounts"
              element={<AccountsPage />}
            />

            <Route
              path="categories"
              element={<CategoriesPage />}
            />

            <Route
              path="transactions"
              element={
                <TransactionsPage />
              }
            />

            <Route
              path="budgets"
              element={<BudgetsPage />}
            />

            <Route
              path="goals"
              element={<GoalsPage />}
            />

            <Route
              path="analytics"
              element={<AnalyticsPage />}
            />

            <Route
              path="reports"
              element={<ReportsPage />}
            />

            <Route
              path="settings"
              element={<SettingsPage />}
            />
          </Route>
        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to={appRoutes.root}
              replace
            />
          }
        />
      </Routes>
    </Suspense>
  );
}

function RouteLoadingScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#f7f9fc] px-4 dark:bg-[#070b15]">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#1f55cf] dark:border-slate-700 dark:border-t-blue-300" />

        <span className="text-sm font-extrabold text-slate-600 dark:text-slate-300">
          Loading workspace...
        </span>
      </div>
    </div>
  );
}
