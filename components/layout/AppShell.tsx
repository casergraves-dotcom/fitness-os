"use client";

// ============================================================
// Imports
// ============================================================

import {
  ReactNode,
} from "react";

import {
  SignInScreen,
  useAuth,
} from "@/features/auth";

import BottomNav from "./BottomNav";
import Header from "./Header";
import PageContainer from "./PageContainer";

// ============================================================
// Types
// ============================================================

interface AppShellProps {
  children: ReactNode;
}

// ============================================================
// App Shell
// ============================================================

export default function AppShell({
  children,
}: AppShellProps) {
  // ----------------------------------------------------------
  // Authentication
  // ----------------------------------------------------------

  const {
    user,
    loaded: authLoaded,
  } = useAuth();

  // ----------------------------------------------------------
  // Wait For Authentication
  // ----------------------------------------------------------

  if (!authLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  // ----------------------------------------------------------
  // Authentication Gate
  // ----------------------------------------------------------

  if (!user) {
    return <SignInScreen />;
  }

  // ----------------------------------------------------------
  // App Layout
  // ----------------------------------------------------------

  return (
    <div className="min-h-dvh bg-slate-50">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[env(safe-area-inset-top)] bg-white"
      />

      <Header />

      <PageContainer>
        {children}
      </PageContainer>

      <BottomNav />
    </div>
  );
}
