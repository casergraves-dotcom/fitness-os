"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/today");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <Link
        href="/today"
        className="text-sm font-medium text-blue-700 underline underline-offset-4"
      >
        Open Fitness OS
      </Link>
    </main>
  );
}
