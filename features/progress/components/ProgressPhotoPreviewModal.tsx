"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  X,
} from "lucide-react";

import {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalShell,
} from "@/components/ui/ModalShell";

import type {
  ProgressPhotoReference,
} from "../bodyCompositionTypes";

interface ProgressPhotoPreviewModalProps {
  photo: ProgressPhotoReference;
  date: string;
  getPhotoUrl: (photo: ProgressPhotoReference) => Promise<string>;
  onClose: () => void;
}

function formatDisplayDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export default function ProgressPhotoPreviewModal({
  photo,
  date,
  getPhotoUrl,
  onClose,
}: ProgressPhotoPreviewModalProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    getPhotoUrl(photo)
      .then((nextUrl) => {
        if (active) setUrl(nextUrl);
      })
      .catch((loadError) => {
        console.error("Progress photo preview failed:", loadError);
        if (active) setError(true);
      });

    return () => {
      active = false;
    };
  }, [getPhotoUrl, photo]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <ModalShell
      labelledBy="progress-photo-preview-title"
      describedBy="progress-photo-preview-description"
      onBackdropPress={onClose}
      className="max-w-2xl"
    >
      <ModalHeader className="flex items-start justify-between gap-4">
        <div>
          <h2 id="progress-photo-preview-title" className="text-lg font-bold text-slate-900">
            {photo.view} progress photo
          </h2>
          <p id="progress-photo-preview-description" className="mt-1 text-sm text-slate-500">
            {formatDisplayDate(date)} · Private authenticated preview
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close progress photo preview"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <X size={20} />
        </button>
      </ModalHeader>

      <ModalBody className="flex items-center justify-center bg-slate-950 p-3 sm:p-4">
        {!url && !error && (
          <p className="py-16 text-sm font-medium text-white">Loading private photo…</p>
        )}

        {error && (
          <div className="rounded-xl bg-white p-5 text-center">
            <p className="font-semibold text-slate-900">Photo unavailable</p>
            <p className="mt-1 text-sm text-slate-500">
              The weekly check-in remains available even though this photo could not be loaded.
            </p>
          </div>
        )}

        {url && (
          // The URL is short-lived and generated from the authenticated private bucket.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={`${photo.view} progress photo from ${formatDisplayDate(date)}`}
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        )}
      </ModalBody>

      <ModalFooter className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Close
        </button>
      </ModalFooter>
    </ModalShell>
  );
}
