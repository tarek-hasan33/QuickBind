import type { ReactNode } from "react";

import { TitleBar } from "./TitleBar";

type AppShellProps = {
  sidebar: ReactNode;
  children: ReactNode;
};

export const AppShell = ({ sidebar, children }: AppShellProps) => (
  <div className="flex h-screen flex-col overflow-hidden">
    <TitleBar />
    <div className="flex flex-1 overflow-hidden">
      {sidebar}
      <main className="flex-1 overflow-hidden bg-[var(--color-bg-surface)]">
        {children}
      </main>
    </div>
  </div>
);
