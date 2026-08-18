import { SiteHeader } from "@/components/site-header";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { NotificationPoller } from "@/components/notifications/notification-poller";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <div className="flex w-full flex-1 flex-col items-center gap-12">
        <NotificationPoller />
        <SiteHeader />
        <div className="flex w-full max-w-5xl flex-1 flex-col gap-8 p-5">
          {children}
        </div>
        <footer className="mx-auto flex w-full items-center justify-center gap-8 border-t py-8 text-center text-xs">
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
