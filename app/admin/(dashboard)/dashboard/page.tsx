import { Suspense } from "react";
import Link from "next/link";
import {
  BarChart3,
  CalendarPlus,
  CalendarRange,
  Users,
  UserPlus,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminDashboardStatsSkeleton } from "@/components/gather/loading-skeleton";
import { getDashboardStats } from "@/lib/supabase/gather-queries";
import type { DashboardStats } from "@/lib/types";

const QUICK_LINKS = [
  { href: "/admin/events", label: "이벤트 관리", icon: CalendarRange },
  { href: "/admin/users", label: "사용자 관리", icon: Users },
  { href: "/admin/analytics", label: "통계 분석", icon: BarChart3 },
] as const;

function buildStatCards(stats: DashboardStats) {
  return [
    {
      label: "오늘 생성된 이벤트",
      value: stats.events.today,
      icon: CalendarPlus,
    },
    {
      label: "이번 주 생성된 이벤트",
      value: stats.events.thisWeek,
      icon: CalendarRange,
    },
    {
      label: "이번 달 생성된 이벤트",
      value: stats.events.thisMonth,
      icon: CalendarRange,
    },
    {
      label: "전체 이벤트 수",
      value: stats.events.total,
      icon: CalendarRange,
    },
    {
      label: "오늘 가입한 사용자",
      value: stats.users.today,
      icon: UserPlus,
    },
    {
      label: "이번 주 가입한 사용자",
      value: stats.users.thisWeek,
      icon: UserPlus,
    },
    {
      label: "전체 사용자 수",
      value: stats.users.total,
      icon: Users,
    },
  ] as const;
}

async function DashboardStatsGrid() {
  const stats = await getDashboardStats();
  const statCards = buildStatCards(stats);

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {statCards.map(({ label, value, icon: Icon }) => (
        <Card key={label}>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {label}
            </CardTitle>
            <Icon className="size-8 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">관리자 대시보드</h1>

      <Suspense fallback={<AdminDashboardStatsSkeleton />}>
        <DashboardStatsGrid />
      </Suspense>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <Card className="transition-colors hover:bg-accent/50">
              <CardContent className="flex items-center gap-3 py-6">
                <Icon className="size-5 text-primary" />
                <span className="font-medium">{label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
