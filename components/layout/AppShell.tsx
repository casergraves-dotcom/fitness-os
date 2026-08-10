"use client";

// ============================================================
// Imports
// ============================================================

import {
  ReactNode,
  useEffect,
  useState,
} from "react";

import BottomNav from "./BottomNav";
import Header from "./Header";
import PageContainer from "./PageContainer";

import {
  migrateExerciseIds,
} from "@/features/workout/migrateExerciseIds";

import {
  SignInScreen,
  useAuth,
} from "@/features/auth";

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
  loaded:
    authLoaded,
} = useAuth();

  // ----------------------------------------------------------
  // Data Migration
  // ----------------------------------------------------------

  const [
    migrationsComplete,
    setMigrationsComplete,
  ] = useState(false);

  useEffect(() => {
    // Run any one-time localStorage migrations before
    // rendering screens that depend on workout data.

    migrateExerciseIds();

    setMigrationsComplete(
      true
    );
  }, []);

// ----------------------------------------------------------
// Wait For Initialization
// ----------------------------------------------------------

if (
  !authLoaded ||
  !migrationsComplete
) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      Loading...
    </div>
  );
}

// ----------------------------------------------------------
// Authentication Gate
// ----------------------------------------------------------

if (!user) {
  return (
    <SignInScreen />
  );
}

  // ----------------------------------------------------------
  // App Layout
  // ----------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main
        className="
          pb-[calc(5rem+env(safe-area-inset-bottom))]
        "
      >
        <PageContainer>
          {children}
        </PageContainer>
      </main>

      <BottomNav />
    </div>
  );
}