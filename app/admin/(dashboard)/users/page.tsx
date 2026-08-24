import { AdminUsersTable } from "@/components/gather/admin-users-table";
import { MOCK_ADMIN_USERS } from "@/lib/mock/admin";
import { MOCK_CURRENT_USER } from "@/lib/mock/gather";

// Task 011: 검색/필터/삭제(F014)를 Supabase 쿼리와 Server Action으로 교체 예정
export default function AdminUsersPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">사용자 관리</h1>
      <AdminUsersTable
        initialUsers={MOCK_ADMIN_USERS}
        currentUserId={MOCK_CURRENT_USER.id}
      />
    </div>
  );
}
