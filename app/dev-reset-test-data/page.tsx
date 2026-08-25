"use client";

import {
  useState,
} from "react";

import {
  removeFitnessOsStorage,
} from "@/lib/storage/fitnessOsStorage";


const CLOUD_BACKED_TEST_KEYS = [
  "fitness-os-training-plan-state",
  "fitness-os-training-activity-completions",
  "fitness-os-morning-check-ins",
  "fitness-os-workout-history",
  "fitness-os-run-history",
] as const;


const DEVICE_LOCAL_TEST_KEYS = [
  "fitness-os-active-workout",
  "fitness-os-active-run",
] as const;


export default function ResetTestDataPage() {
  const [
    status,
    setStatus,
  ] =
    useState<
      "Idle" |
      "Resetting" |
      "Complete"
    >(
      "Idle"
    );


  function resetTestData() {
    setStatus(
      "Resetting"
    );


    for (
      const key
      of CLOUD_BACKED_TEST_KEYS
    ) {
      removeFitnessOsStorage(
        key
      );
    }


    for (
      const key
      of DEVICE_LOCAL_TEST_KEYS
    ) {
      localStorage.removeItem(
        key
      );
    }


    // Cloud deletes are asynchronous in removeFitnessOsStorage().
    // Give them a moment to dispatch before declaring the one-time
    // reset complete.
    window.setTimeout(
      () => {
        setStatus(
          "Complete"
        );
      },
      3000
    );
  }


  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-red-600">
          Development Utility
        </p>

        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          Reset Fitness OS Test Data
        </h1>

        <p className="mt-4 text-sm leading-6 text-slate-600">
          This removes training-plan state, activity completions,
          morning check-ins, workout history, run history, and any
          active workout/run.
        </p>

        <p className="mt-3 text-sm font-medium text-slate-800">
          Custom exercises and workout templates are preserved.
        </p>

        <button
          type="button"
          disabled={
            status !==
            "Idle"
          }
          onClick={
            resetTestData
          }
          className="mt-6 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700 disabled:bg-slate-300"
        >
          {status ===
          "Idle"
            ? "Delete Test Data"
            : status ===
                "Resetting"
              ? "Deleting..."
              : "Reset Complete"}
        </button>

        {status ===
          "Complete" && (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="font-semibold text-emerald-800">
              Reset complete.
            </p>

            <p className="mt-1 text-sm text-emerald-700">
              Close this page, reload Fitness OS, and verify the
              histories and active training plan are empty.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}