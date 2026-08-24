import { AdminSidebar } from "@/components/gather/admin-sidebar";
import { ThemeSwitcher } from "@/components/theme-switcher";

// admin 권한 체크는 proxy.ts(updateSession)에서 gather_is_admin() RPC로 처리됨
export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <main className="flex-1 p-6">{children}</main>
        <footer className="flex items-center justify-end border-t p-4">
          <ThemeSwitcher />
        </footer>
      </div>
    </div>
  );
}
