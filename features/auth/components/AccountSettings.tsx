"use client";

import { useState } from "react";
import { LogOut, UserRound } from "lucide-react";

import { clearLocalFitnessOsData } from "@/lib/storage/clearLocalFitnessOsData";
import { supabase } from "@/lib/supabase/client";

import { useAuth } from "../hooks/useAuth";


export default function AccountSettings() {
  const { user } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setSigningOut(true);
    setError(null);

    const { error: signOutError } =
      await supabase.auth.signOut();

    if (signOutError) {
      setError(signOutError.message);
      setSigningOut(false);
      return;
    }

    clearLocalFitnessOsData();
    window.location.replace("/");
  }

  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-slate-500">
        ACCOUNT
      </p>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <UserRound size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900">
              Signed-in account
            </p>
            <p className="mt-1 truncate text-sm text-slate-500">
              {user?.email ?? "Authenticated user"}
            </p>
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut size={18} />
          {signingOut ? "Signing Out..." : "Sign Out or Switch Account"}
        </button>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          Signing out clears this device&apos;s Fitness OS cache. Your synchronized records remain private in your account.
        </p>
      </div>
    </div>
  );
}
