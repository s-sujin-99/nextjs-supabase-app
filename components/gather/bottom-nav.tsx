import Link from "next/link";
import { CalendarDays, Plus, User } from "lucide-react";

// Task 005: 이벤트 역할(host/participant)은 전역이 아닌 이벤트별 값이라 하단 내비게이션
// 자체는 분기하지 않는다 — 참여자 전용 무네비 진입점은 /join/[code](레이아웃 밖 라우트)로 이미 분리되어 있다.
// TODO(Task 008): 현재 경로 하이라이트 추가 예정
export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 flex h-16 items-center justify-around border-t bg-background sm:hidden">
      <Link
        href="/events"
        className="flex flex-col items-center gap-1 text-xs text-muted-foreground"
      >
        <CalendarDays className="size-5" />내 이벤트
      </Link>
      <Link
        href="/events/new"
        className="flex flex-col items-center gap-1 text-xs text-muted-foreground"
      >
        <Plus className="size-5" />
        만들기
      </Link>
      <Link
        href="/profile"
        className="flex flex-col items-center gap-1 text-xs text-muted-foreground"
      >
        <User className="size-5" />
        프로필
      </Link>
    </nav>
  );
}
