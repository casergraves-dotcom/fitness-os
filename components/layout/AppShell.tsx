"use client";

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

interface AppShellProps {
  children: ReactNode;
}

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

    setMigrationsComplete(true);
  }, []);

  // ----------------------------------------------------------
  // Wait For Migration
  // ----------------------------------------------------------

  if (!migrationsComplete) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="p-4 text-sm text-slate-500">
          Loading...
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------
  // App Layout
  // ----------------------------------------------------------

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Header />

      <PageContainer>
        {children}
      </PageContainer>

      <BottomNav />
    </div>
  );
}