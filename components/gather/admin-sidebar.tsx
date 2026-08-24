import Link from "next/link";
import { LayoutDashboard, CalendarRange, Users, BarChart3 } from "lucide-react";

import { LogoutButton } from "@/components/logout-button";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "대시보드", icon: LayoutDashboard },
  { href: "/admin/events", label: "이벤트 관리", icon: CalendarRange },
  { href: "/admin/users", label: "사용자 관리", icon: Users },
  { href: "/admin/analytics", label: "통계 분석", icon: BarChart3 },
];

// TODO(Task 013): 현재 경로 하이라이트 예정 (admin 권한 체크는 Task 008에서 proxy.ts로 이관됨)
export function AdminSidebar() {
  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r p-4 md:flex">
      <p className="mb-6 px-2 text-sm font-semibold">Gather Admin</p>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </nav>
      <LogoutButton redirectTo="/admin/login" />
    </aside>
  );
}
