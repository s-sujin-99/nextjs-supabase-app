import Link from "next/link";
import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { hasEnvVars } from "@/lib/utils";

export function SiteHeader() {
  return (
    <nav className="flex h-16 w-full justify-center border-b border-b-foreground/10">
      <div className="flex w-full max-w-5xl items-center justify-between p-3 px-5 text-sm">
        <div className="flex items-center gap-5 font-semibold">
          <Link href="/groups">모임 이벤트 관리</Link>
        </div>
        {!hasEnvVars ? (
          <EnvVarWarning />
        ) : (
          <div className="flex items-center gap-2">
            <Suspense>
              <NotificationBell />
            </Suspense>
            <Suspense>
              <AuthButton />
            </Suspense>
          </div>
        )}
      </div>
    </nav>
  );
}
