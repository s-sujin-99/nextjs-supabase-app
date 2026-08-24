import Link from "next/link";
import { CalendarDays, Plus, User } from "lucide-react";

// TODO(Task 004/005): 현재 경로 하이라이트, 주최자/참여자 뷰 분기 로직 추가 예정
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
