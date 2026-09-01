import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
}

export default function PageContainer({
  children,
}: PageContainerProps) {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-6 pb-[calc(8rem+env(safe-area-inset-bottom))] sm:px-6">
        {children}
    </main>
  );
}
