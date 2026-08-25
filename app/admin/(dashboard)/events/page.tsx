import { Suspense } from "react";

import { AdminEventsTable } from "@/components/gather/admin-events-table";
import { AdminTableSkeleton } from "@/components/gather/loading-skeleton";
import { getAdminEvents } from "@/lib/supabase/gather-queries";

async function AdminEventsContent() {
  const events = await getAdminEvents();
  return <AdminEventsTable initialEvents={events} />;
}

export default function AdminEventsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">이벤트 관리</h1>
      <Suspense fallback={<AdminTableSkeleton />}>
        <AdminEventsContent />
      </Suspense>
    </div>
  );
}
