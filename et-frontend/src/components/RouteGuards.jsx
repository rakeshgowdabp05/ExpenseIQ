import {
    Navigate,
    Outlet,
    useLocation,
  } from "react-router";
  import { appRoutes } from "../config/appConfig";
  import { useAuth } from "../hooks/useAuth";
  
  function LoadingScreen() {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-11 w-11 animate-spin rounded-full border-4 border-slate-200 border-t-[#2457d6] dark:border-slate-800 dark:border-t-cyan-300" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Securing your workspace...
          </p>
        </div>
      </div>
    );
  }
  
  export function ProtectedRoute() {
    const {
      authenticationStatus,
      isAuthenticated,
    } = useAuth();
  
    const location = useLocation();
  
    if (authenticationStatus === "loading") {
      return <LoadingScreen />;
    }
  
    if (!isAuthenticated) {
      return (
        <Navigate
          to={appRoutes.login}
          state={{ from: location.pathname }}
          replace
        />
      );
    }
  
    return <Outlet />;
  }
  
  export function PublicRoute() {
    const {
      authenticationStatus,
      isAuthenticated,
    } = useAuth();
  
    if (authenticationStatus === "loading") {
      return <LoadingScreen />;
    }
  
    if (isAuthenticated) {
      return (
        <Navigate
          to={appRoutes.workspace}
          replace
        />
      );
    }
  
    return <Outlet />;
  }
