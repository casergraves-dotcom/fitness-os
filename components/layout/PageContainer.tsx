import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
}

export default function PageContainer({
  children,
}: PageContainerProps) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 pt-6 pb-[calc(7rem+env(safe-area-inset-bottom))]">
        {children}
    </main>
  );
}