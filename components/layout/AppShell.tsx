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
  // Wait For Migration
  // ----------------------------------------------------------

  if (!migrationsComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
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