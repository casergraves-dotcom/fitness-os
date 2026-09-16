"use client";

import { useEffect, type HTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface ModalShellProps {
  children: ReactNode;
  labelledBy: string;
  describedBy?: string;
  onBackdropPress?: () => void;
  className?: string;
}

export function ModalShell({ children, labelledBy, describedBy, onBackdropPress, className }: ModalShellProps) {
  useEffect(() => {
    const scrollY = window.scrollY;
    const previous = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = previous.overflow;
      document.body.style.position = previous.position;
      document.body.style.top = previous.top;
      document.body.style.width = previous.width;
      window.scrollTo(0, scrollY);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overscroll-none bg-slate-950/50 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onBackdropPress?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        className={cn(
          "flex max-h-[calc(100dvh-1.5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("shrink-0 px-5 pt-5 pb-4 sm:px-6 sm:pt-6", className)} {...props} />;
}

export function ModalBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 [-webkit-overflow-scrolling:touch] sm:px-6", className)} {...props} />;
}

export function ModalFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("shrink-0 border-t border-slate-200 bg-white px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6", className)} {...props} />;
}
