"use client";

import { useEffect, useRef, useState } from "react";

import type { WorkoutRestTimer } from "../types";
import { getRestTimerRemainingSeconds } from "../logic/restTimer";
import { useWorkoutPreferences } from "../hooks/useWorkoutPreferences";
import {
  playRestCompletionSound,
  vibrateForRestCompletion,
} from "../restCompletionCues";

interface RestTimerProps {
  timer?: WorkoutRestTimer;
  onPause: () => void;
  onResume: () => void;
  onAdjust: (seconds: number) => void;
  onSkip: () => void;
}

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}

export default function RestTimer({
  timer,
  onPause,
  onResume,
  onAdjust,
  onSkip,
}: RestTimerProps) {
  const { preferences } = useWorkoutPreferences();
  const [now, setNow] = useState(() => Date.now());
  const notifiedTimerRef = useRef<string>(undefined);

  useEffect(() => {
    if (!timer || timer.pausedRemainingSeconds !== undefined) {
      return;
    }

    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timer]);

  const remaining = timer
    ? getRestTimerRemainingSeconds(timer, now)
    : 0;
  const complete = Boolean(timer) && remaining === 0;
  const timerKey = timer ? `${timer.startedAt}-${timer.endsAt}` : undefined;

  useEffect(() => {
    if (!complete || !timerKey || notifiedTimerRef.current === timerKey) {
      return;
    }

    notifiedTimerRef.current = timerKey;

    if (preferences.restCompletionCues.sound) {
      void playRestCompletionSound();
    }

    if (preferences.restCompletionCues.vibration) {
      vibrateForRestCompletion();
    }
  }, [
    complete,
    preferences.restCompletionCues.sound,
    preferences.restCompletionCues.vibration,
    timerKey,
  ]);

  if (!timer) {
    return null;
  }

  const paused = timer.pausedRemainingSeconds !== undefined;

  return (
    <div
      className={`mt-3 rounded-xl border px-3 py-2.5 ${
        complete
          ? "border-green-200 bg-green-50"
          : "border-blue-200 bg-blue-50"
      }`}
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-xs font-semibold uppercase tracking-wide ${
            complete ? "text-green-700" : "text-blue-700"
          }`}>
            {complete ? "Rest complete" : paused ? "Rest paused" : "Resting"}
          </p>
          {timer.exerciseName && !complete && (
            <p className="truncate text-xs text-slate-600">
              After {timer.exerciseName}
            </p>
          )}
        </div>

        <p className={`shrink-0 font-mono text-xl font-bold ${
          complete ? "text-green-700" : "text-slate-950"
        }`}>
          {formatCountdown(remaining)}
        </p>
      </div>

      <div className="mt-2 grid grid-cols-4 gap-1.5">
        <button
          type="button"
          onClick={() => {
            if (paused) {
              setNow(Date.now());
              onResume();
              return;
            }

            onPause();
          }}
          disabled={complete}
          className="min-h-10 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 disabled:opacity-50"
        >
          {paused ? "Resume" : "Pause"}
        </button>
        <button
          type="button"
          onClick={() => {
            setNow(Date.now());
            onAdjust(-30);
          }}
          disabled={complete}
          className="min-h-10 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 disabled:opacity-50"
        >
          −30s
        </button>
        <button
          type="button"
          onClick={() => {
            setNow(Date.now());
            onAdjust(30);
          }}
          className="min-h-10 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700"
        >
          +30s
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="min-h-10 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700"
        >
          {complete ? "Dismiss" : "Skip"}
        </button>
      </div>
    </div>
  );
}
