import { AdminEventsTable } from "@/components/gather/admin-events-table";
import { MOCK_ADMIN_EVENTS } from "@/lib/mock/admin";

// Task 011: 검색/필터/삭제(F013)를 Supabase 쿼리와 Server Action으로 교체 예정
export default function AdminEventsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">이벤트 관리</h1>
      <AdminEventsTable initialEvents={MOCK_ADMIN_EVENTS} />
    </div>
  );
}
