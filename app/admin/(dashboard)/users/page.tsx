import { Suspense } from "react";

import { AdminUsersTable } from "@/components/gather/admin-users-table";
import { getAdminUsers, getCurrentUserId } from "@/lib/supabase/gather-queries";

async function AdminUsersContent() {
  const [users, currentUserId] = await Promise.all([
    getAdminUsers(),
    getCurrentUserId(),
  ]);

  return (
    <AdminUsersTable initialUsers={users} currentUserId={currentUserId ?? ""} />
  );
}

export default function AdminUsersPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">사용자 관리</h1>
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        }
      >
        <AdminUsersContent />
      </Suspense>
    </div>
  );
}
