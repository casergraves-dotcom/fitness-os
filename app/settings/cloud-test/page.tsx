"use client";

// ============================================================
// Imports
// ============================================================

import {
  useState,
} from "react";

import {
  loadFitnessCloudData,
  saveFitnessCloudData,
} from "@/lib/supabase/fitnessData";

import {
  createLocalStorageSnapshot,
} from "@/lib/storage/snapshot";

import {
  readCloudData,
  saveCloudData,
} from "@/lib/supabase/cloudStorage";

import {
  downloadStorageKey,
  uploadStorageKey,
} from "@/lib/storage/cloudSync";

import {
  FITNESS_OS_STORAGE_KEYS,
} from "@/lib/storage/fitnessOsStorageKeys";


// ============================================================
// Cloud Test Page
// ============================================================

export default function CloudTestPage() {
  const [
    result,
    setResult,
  ] =
    useState<string>(
      "Not tested yet."
    );

  const [
    loading,
    setLoading,
  ] =
    useState(false);


  // ==========================================================
  // Helpers
  // ==========================================================

  function formatError(
    error: unknown
  ) {
    if (
      error instanceof Error
    ) {
      return JSON.stringify(
        {
          name:
            error.name,

          message:
            error.message,
        },
        null,
        2
      );
    }

    if (
      typeof error ===
        "object" &&
      error !== null
    ) {
      return JSON.stringify(
        error,
        null,
        2
      );
    }

    return String(error);
  }


  // ==========================================================
  // Run Cloud Test
  // ==========================================================

  async function runTest() {
    setLoading(true);

    setResult(
      "Testing..."
    );

    try {
      const testData = {
        message:
          "Fitness OS cloud sync test",

        testedAt:
          new Date()
            .toISOString(),
      };

      await saveFitnessCloudData(
        "cloud_test",
        testData
      );

      const record =
        await loadFitnessCloudData<
          typeof testData
        >(
          "cloud_test"
        );

      if (!record) {
        throw new Error(
          "Cloud record was not found after saving."
        );
      }

      setResult(
        JSON.stringify(
          record,
          null,
          2
        )
      );
    } catch (error) {
      console.error(
        "Fitness OS cloud test failed:",
        error
      );

      setResult(
        formatError(
          error
        )
      );
    } finally {
      setLoading(false);
    }
  }


  // ==========================================================
  // Preview Local Snapshot
  // ==========================================================

  function previewLocalSnapshot() {
    try {
      const snapshot =
        createLocalStorageSnapshot();

      setResult(
        JSON.stringify(
          snapshot,
          null,
          2
        )
      );
    } catch (error) {
      console.error(
        "Fitness OS snapshot preview failed:",
        error
      );

      setResult(
        formatError(
          error
        )
      );
    }
  }


  // ==========================================================
  // Test Cloud Storage Service
  // ==========================================================

  async function testCloudStorage() {
    setLoading(true);

    try {
      const testData = {
        message:
          "Fitness OS cloud storage service test",

        testedAt:
          new Date()
            .toISOString(),

        device:
          navigator.userAgent,
      };

      await saveCloudData(
        "fitness-os-sync-test",
        testData
      );

      const cloudRecord =
        await readCloudData(
          "fitness-os-sync-test"
        );

      setResult(
        JSON.stringify(
          cloudRecord,
          null,
          2
        )
      );
    } catch (error) {
      console.error(
        "Fitness OS cloud storage test failed:",
        error
      );

      setResult(
        formatError(
          error
        )
      );
    } finally {
      setLoading(false);
    }
  }


  // ==========================================================
  // Read Existing Cloud Storage Test
  // ==========================================================

  async function readStorageTest() {
    setLoading(true);

    try {
      const cloudRecord =
        await readCloudData(
          "fitness-os-sync-test"
        );

      setResult(
        JSON.stringify(
          cloudRecord,
          null,
          2
        )
      );
    } catch (error) {
      console.error(
        "Fitness OS cloud storage read failed:",
        error
      );

      setResult(
        formatError(
          error
        )
      );
    } finally {
      setLoading(false);
    }
  }


  // ==========================================================
  // Test Sync Engine
  // ==========================================================

  async function testSyncEngine() {
    setLoading(true);

    const key =
      FITNESS_OS_STORAGE_KEYS
        .trainingPlanState;

    const originalValue =
      localStorage.getItem(
        key
      );

    try {
      const testData = {
        syncEngineTest:
          true,

        message:
          "Fitness OS sync engine test",

        createdAt:
          new Date()
            .toISOString(),
      };

      // Write temporary data locally.
      localStorage.setItem(
        key,
        JSON.stringify(
          testData
        )
      );

      // Upload using the real sync engine.
      await uploadStorageKey(
        key
      );

      // Remove the local copy so the test proves
      // that cloud hydration restores it.
      localStorage.removeItem(
        key
      );

      const downloaded =
        await downloadStorageKey(
          key
        );

      const restoredValue =
        localStorage.getItem(
          key
        );

      setResult(
        JSON.stringify(
          {
            downloaded,

            restoredValue:
              restoredValue
                ? JSON.parse(
                    restoredValue
                  )
                : null,
          },
          null,
          2
        )
      );
    } catch (error) {
      console.error(
        "Fitness OS sync engine test failed:",
        error
      );

      setResult(
        formatError(
          error
        )
      );
    } finally {
      // Restore the local state that existed
      // before the diagnostic test.
      if (
        originalValue ===
        null
      ) {
        localStorage.removeItem(
          key
        );
      } else {
        localStorage.setItem(
          key,
          originalValue
        );
      }

      setLoading(false);
    }
  }


  // ==========================================================
  // Render
  // ==========================================================

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl">

        <h1 className="text-2xl font-bold text-slate-900">
          Fitness OS Cloud Test
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Development diagnostics for authenticated
          Fitness OS cloud storage and synchronization.
        </p>


        <div className="mt-6 flex flex-wrap gap-3">

          <button
            type="button"
            onClick={
              runTest
            }
            disabled={
              loading
            }
            className="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading
              ? "Testing..."
              : "Run Cloud Test"}
          </button>


          <button
            type="button"
            onClick={
              previewLocalSnapshot
            }
            disabled={
              loading
            }
            className="rounded-xl border border-blue-600 bg-white px-4 py-3 font-semibold text-blue-600 disabled:opacity-60"
          >
            Preview Local Data
          </button>


          <button
            type="button"
            onClick={
              testCloudStorage
            }
            disabled={
              loading
            }
            className="rounded-xl border border-blue-600 bg-white px-4 py-3 font-semibold text-blue-600 disabled:opacity-60"
          >
            Test Storage Service
          </button>


          <button
            type="button"
            onClick={
              readStorageTest
            }
            disabled={
              loading
            }
            className="rounded-xl border border-blue-600 bg-white px-4 py-3 font-semibold text-blue-600 disabled:opacity-60"
          >
            Read Storage Test
          </button>


          <button
            type="button"
            onClick={
              testSyncEngine
            }
            disabled={
              loading
            }
            className="rounded-xl border border-blue-600 bg-white px-4 py-3 font-semibold text-blue-600 disabled:opacity-60"
          >
            Test Sync Engine
          </button>

        </div>


        <pre className="mt-6 overflow-auto rounded-xl bg-slate-900 p-4 text-sm text-slate-100">
          {result}
        </pre>

      </div>
    </main>
  );
}