import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGroupMembership } from "@/lib/groups/membership";
import { Skeleton } from "@/components/ui/skeleton";
import { AnnouncementForm } from "@/components/announcements/announcement-form";

export default function NewAnnouncementPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">새 공지 작성</h2>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <NewAnnouncementGate params={params} />
      </Suspense>
    </div>
  );
}

async function NewAnnouncementGate({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const membership = await getGroupMembership(groupId);

  if (!membership || membership.role !== "organizer") {
    notFound();
  }

  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("id, title")
    .eq("group_id", groupId)
    .order("starts_at", { ascending: false });

  return <AnnouncementForm groupId={groupId} events={events ?? []} />;
}
