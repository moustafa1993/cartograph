import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { Suspense } from "react";
import { WORKSPACE_PATH } from "@/lib/routes";
import { ThemeControl } from "../theme-control";

// The shell every signed-in page renders inside: a fixed top bar and a main
// area that owns its own scrolling.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex h-dvh flex-col">
      <header className="flex h-9 shrink-0 items-center gap-3 border-b border-border bg-surface px-3">
        <span className="font-mono text-xs font-semibold">cartograph</span>
        {/* Auth state is per-request; Suspense keeps the bar prerenderable. */}
        <Suspense>
          <OrganizationSwitcher
            hidePersonal
            afterSelectOrganizationUrl={WORKSPACE_PATH}
            afterCreateOrganizationUrl={WORKSPACE_PATH}
            afterLeaveOrganizationUrl={WORKSPACE_PATH}
          />
        </Suspense>
        <div className="ml-auto flex items-center gap-3">
          <ThemeControl />
          <Suspense>
            <UserButton />
          </Suspense>
        </div>
      </header>
      <main className="min-h-0 flex-1 overflow-auto">{children}</main>
    </div>
  );
}
