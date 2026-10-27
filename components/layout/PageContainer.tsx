import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  focused?: boolean;
}

export default function PageContainer({
  children,
  focused = false,
}: PageContainerProps) {
  return (
    <main className={`mx-auto w-full max-w-5xl flex-1 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pb-[calc(8rem+env(safe-area-inset-bottom))] sm:px-6 ${focused ? "pt-[calc(env(safe-area-inset-top)+0.75rem)]" : "pt-6"}`}>
        {children}
    </main>
  );
}
