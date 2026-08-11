"use client";

// ============================================================
// Imports
// ============================================================

import {
  ReactNode,
  useEffect,
  useState,
} from "react";

import {
  migrateExerciseIds,
} from "@/features/workout/migrateExerciseIds";

import { supabase } from "@/lib/supabase/client";

import {
  downloadAllCloudData,
} from "@/lib/storage/cloudSync";

// ============================================================
// Types
// ============================================================

interface CloudSyncProviderProps {
  children: ReactNode;
}

// ============================================================
// Cloud Sync Provider
// ============================================================

export default function CloudSyncProvider({
  children,
}: CloudSyncProviderProps) {
  const [
    hydrationComplete,
    setHydrationComplete,
  ] = useState(false);

  useEffect(() => {
    let mounted = true;

    // --------------------------------------------------------
    // Initialize Fitness OS
    // --------------------------------------------------------

    async function initializeFitnessOs() {
      try {
        // ----------------------------------------------------
        // 1. Check Authentication
        // ----------------------------------------------------

        const {
          data: { session },
        } = await supabase.auth.getSession();

        // ----------------------------------------------------
        // 2. Hydrate Cloud Data
        // ----------------------------------------------------

        if (session) {
          await downloadAllCloudData();
        }

        // ----------------------------------------------------
        // 3. Run Local Data Migrations
        // ----------------------------------------------------

        migrateExerciseIds();
      } catch (error) {
        // Cloud failure must never prevent Fitness OS from
        // starting or prevent local migrations from running.
        console.error(
          "Fitness OS initialization failed:",
          error,
        );

        migrateExerciseIds();
      } finally {
        if (mounted) {
          setHydrationComplete(true);
        }
      }
    }

    void initializeFitnessOs();

    return () => {
      mounted = false;
    };
  }, []);

  // ----------------------------------------------------------
  // Wait For Initial Hydration
  // ----------------------------------------------------------

  if (!hydrationComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading Fitness OS...
      </div>
    );
  }

  return children;
}