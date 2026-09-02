"use client";

import {
  HeartPulse,
  RefreshCw,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useDailySteps,
} from "@/features/dailyActivity";
import {
  createCapacitorAppleHealthStepBridge,
} from "../capacitorAppleHealthStepBridge";
import type {
  AppleHealthStepAccessState,
} from "../appleHealthStepBridge";
import {
  syncAndPersistAppleHealthSteps,
} from "../syncAndPersistAppleHealthSteps";
import type {
  AppleHealthStepSyncResult,
} from "../syncAppleHealthSteps";

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getInitialSyncRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 83);
  return {
    startDate: formatLocalDate(start),
    endDate: formatLocalDate(end),
  };
}

function getFeedback(result: AppleHealthStepSyncResult) {
  switch (result.status) {
    case "Synced":
      return result.added + result.updated > 0
        ? `Synced ${result.added + result.updated} day${result.added + result.updated === 1 ? "" : "s"}.`
        : "Apple Health is connected. Your manual corrections were preserved.";
    case "PartialHistory":
      return `Synced ${result.added + result.updated} accessible day${result.added + result.updated === 1 ? "" : "s"}. Apple Health provided limited history.`;
    case "NoAccessibleData":
      return "No accessible step history was returned. You can review Fitness OS access in the Health app.";
    case "Unavailable":
      return "Apple Health is unavailable on this device.";
    case "AuthorizationRequired":
      return "Connect Apple Health before syncing steps.";
    case "Failed":
      return "Apple Health could not sync. Your existing steps were not changed.";
  }
}

export default function AppleHealthStepSettings() {
  const bridge = useMemo(
    () => createCapacitorAppleHealthStepBridge(),
    []
  );
  const { records } = useDailySteps();
  const [access, setAccess] = useState<AppleHealthStepAccessState | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    bridge.getAccessState()
      .then((nextAccess) => {
        if (active) setAccess(nextAccess);
      })
      .catch(() => {
        if (active) {
          setAccess({
            availability: "Unavailable",
            authorizationRequested: false,
          });
        }
      });
    return () => { active = false; };
  }, [bridge]);

  if (!access || access.availability === "Unavailable") {
    return null;
  }

  const latestSync = records
    .filter((record) => record.source === "AppleHealth" && record.sourceSyncedAt)
    .map((record) => record.sourceSyncedAt as string)
    .sort()
    .at(-1);

  async function handleSync() {
    setSyncing(true);
    setFeedback(null);
    const result = await syncAndPersistAppleHealthSteps({
      bridge,
      ...getInitialSyncRange(),
      requestAuthorization: !access?.authorizationRequested,
    });
    setFeedback(getFeedback(result));
    setAccess(await bridge.getAccessState());
    setSyncing(false);
  }

  return (
    <section>
      <p className="mb-2 text-sm font-semibold text-slate-500">
        HEALTH DATA
      </p>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <HeartPulse size={20} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900">
              Apple Health Steps
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Import daily totals into the same step history used throughout Fitness OS. Manual corrections always win.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm">
          <p className="font-medium text-slate-900">
            {access.authorizationRequested ? "Connection requested" : "Not connected"}
          </p>
          <p className="mt-1 text-slate-500">
            {latestSync
              ? `Last successful import: ${new Date(latestSync).toLocaleString()}`
              : "The first sync requests access and imports up to 12 weeks of available history."}
          </p>
          {feedback && (
            <p className="mt-2 font-medium text-slate-700" role="status">
              {feedback}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleSync}
          disabled={syncing}
          className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={17} className={syncing ? "animate-spin" : ""} />
          {syncing
            ? "Syncing…"
            : access.authorizationRequested
              ? "Sync now"
              : "Connect Apple Health"}
        </button>
      </div>
    </section>
  );
}
