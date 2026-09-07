"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  supabase,
} from "@/lib/supabase/client";

// ============================================================
// Sign In Screen
// ============================================================

export default function SignInScreen() {
  const [mode, setMode] =
    useState<"sign-in" | "create-account">("sign-in");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [message, setMessage] =
    useState<string | null>(null);

  // ----------------------------------------------------------
  // Sign In
  // ----------------------------------------------------------

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(
      true
    );

    setError(null);
    setMessage(null);

    if (mode === "create-account") {
      const {
        data,
        error: signUpError,
      } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        window.location.replace("/");
        return;
      }

      setMessage(
        "Account created. Check your email to confirm it, then sign in.",
      );
      setMode("sign-in");
      setLoading(false);
      return;
    }

    const {
      error:
        signInError,
    } =
      await supabase.auth
        .signInWithPassword({
          email,
          password,
        });

    if (signInError) {
      setError(
        signInError.message
      );

      setLoading(
        false
      );

      return;
    }

    window.location.replace("/");
  }

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold tracking-wider text-blue-600">
            FITNESS OS
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {mode === "sign-in" ? "Welcome Back" : "Create Account"}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {mode === "sign-in"
              ? "Sign in to sync your Fitness OS data."
              : "Create a separate private Fitness OS account."}
          </p>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={
                email
              }
              onChange={
                (event) =>
                  setEmail(
                    event.target.value
                  )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={
                password
              }
              onChange={
                (event) =>
                  setPassword(
                    event.target.value
                  )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          {message && (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={
              loading
            }
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? mode === "sign-in"
                ? "Signing In..."
                : "Creating Account..."
              : mode === "sign-in"
                ? "Sign In"
                : "Create Account"}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setMode((current) =>
                current === "sign-in" ? "create-account" : "sign-in"
              );
              setError(null);
              setMessage(null);
            }}
            className="w-full px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-60"
          >
            {mode === "sign-in"
              ? "Create a separate account"
              : "Already have an account? Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
