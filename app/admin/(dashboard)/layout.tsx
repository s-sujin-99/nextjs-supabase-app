import { AdminSidebar } from "@/components/gather/admin-sidebar";
import { ThemeSwitcher } from "@/components/theme-switcher";

// Task 008: admin 권한 체크 미들웨어 연동 후 비인가 접근 차단 예정
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
