import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGroupMembership } from "@/lib/groups/membership";
import { Skeleton } from "@/components/ui/skeleton";
import { AnnouncementForm } from "@/components/announcements/announcement-form";
import { DeleteAnnouncementButton } from "@/components/announcements/delete-announcement-button";

export default function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ groupId: string; announcementId: string }>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">공지 수정</h2>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <EditAnnouncementGate params={params} />
      </Suspense>
    </div>
  );
}

async function EditAnnouncementGate({
  params,
}: {
  params: Promise<{ groupId: string; announcementId: string }>;
}) {
  const { groupId, announcementId } = await params;
  const membership = await getGroupMembership(groupId);

  if (!membership || membership.role !== "organizer") {
    notFound();
  }

  const supabase = await createClient();
  const [{ data: announcement }, { data: events }] = await Promise.all([
    supabase
      .from("announcements")
      .select("id, title, content, event_id, group_id")
      .eq("id", announcementId)
      .single(),
    supabase
      .from("events")
      .select("id, title")
      .eq("group_id", groupId)
      .order("starts_at", { ascending: false }),
  ]);

  if (!announcement || announcement.group_id !== groupId) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <AnnouncementForm
        groupId={groupId}
        events={events ?? []}
        announcement={{
          id: announcement.id,
          title: announcement.title,
          content: announcement.content,
          eventId: announcement.event_id,
        }}
      />
      <div className="flex justify-end">
        <DeleteAnnouncementButton
          announcementId={announcement.id}
          groupId={groupId}
        />
      </div>
    </div>
  );
}
