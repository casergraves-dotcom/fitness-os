"use client";

import { useEffect, useState } from "react";

interface RestTimerProps {
  startedAt?: string;
}

export default function RestTimer({
  startedAt,
}: RestTimerProps) {
  const [elapsed, setElapsed] = useState("00:00");

  useEffect(() => {
    if (!startedAt) {
      setElapsed("00:00");
      return;
    }

    const updateElapsed = () => {
      const start = new Date(startedAt).getTime();

      const seconds = Math.max(
        0,
        Math.floor((Date.now() - start) / 1000)
      );

      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;

      setElapsed(
        `${String(minutes).padStart(2, "0")}:${String(
          remainingSeconds
        ).padStart(2, "0")}`
      );
    };

    updateElapsed();

    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  if (!startedAt) return null;

  return (
    <div className="mt-4 flex items-center justify-between border-t pt-4">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        Rest
      </span>

      <span className="font-mono text-xl font-bold">
        {elapsed}
      </span>
    </div>
  );
}