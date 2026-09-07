"use client";

import {
  useEffect,
  useState,
} from "react";

import type {
  Session,
  User,
} from "@supabase/supabase-js";

import {
  supabase,
} from "@/lib/supabase/client";

import {
  clearLocalFitnessOsData,
} from "@/lib/storage/clearLocalFitnessOsData";

// ============================================================
// Types
// ============================================================

interface AuthState {
  session:
    Session | null;

  user:
    User | null;

  loaded:
    boolean;
}

// ============================================================
// Authentication
// ============================================================

export function useAuth():
  AuthState {
  const [
    session,
    setSession,
  ] =
    useState<Session | null>(
      null
    );

  const [
    loaded,
    setLoaded,
  ] =
    useState(false);

  useEffect(() => {
    let mounted =
      true;

    // --------------------------------------------------------
    // Load Existing Session
    // --------------------------------------------------------

    const loadSession =
      async () => {
        const {
          data,
        } =
          await supabase.auth
            .getSession();

        if (!mounted) {
          return;
        }

        setSession(
          data.session
        );

        setLoaded(
          true
        );
      };

    loadSession();

    // --------------------------------------------------------
    // Listen For Authentication Changes
    // --------------------------------------------------------

    const {
      data:
        authListener,
    } =
      supabase.auth
        .onAuthStateChange(
          (
            event,
            nextSession
          ) => {
            if (!mounted) {
              return;
            }

            if (event === "SIGNED_OUT") {
              clearLocalFitnessOsData();
            }

            setSession(
              nextSession
            );

            setLoaded(
              true
            );
          }
        );

    // --------------------------------------------------------
    // Cleanup
    // --------------------------------------------------------

    return () => {
      mounted =
        false;

      authListener
        .subscription
        .unsubscribe();
    };
  }, []);

  // ----------------------------------------------------------
  // Result
  // ----------------------------------------------------------

  return {
    session,

    user:
      session?.user ??
      null,

    loaded,
  };
}
