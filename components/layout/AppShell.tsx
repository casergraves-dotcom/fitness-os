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
    <div className="min-h-screen bg-slate-50">
      <Header />

      <PageContainer>
        {children}
      </PageContainer>

      <BottomNav />
    </div>
  );
}