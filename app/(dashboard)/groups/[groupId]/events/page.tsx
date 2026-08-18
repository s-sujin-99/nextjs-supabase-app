import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getGroupMembership } from "@/lib/groups/membership";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EventListTabs } from "@/components/events/event-list-tabs";

export default function EventsPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <EventsContent params={params} />
      </Suspense>
    </div>
  );
}

async function EventsContent({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const supabase = await createClient();

  const [membership, { data: events }] = await Promise.all([
    getGroupMembership(groupId),
    supabase
      .from("events")
      .select("id, title, starts_at, location, is_cancelled")
      .eq("group_id", groupId)
      .order("starts_at", { ascending: true }),
  ]);

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">이벤트</h2>
        {membership?.role === "organizer" && (
          <Button asChild size="sm">
            <Link href={`/groups/${groupId}/events/new`}>새 이벤트</Link>
          </Button>
        )}
      </div>
      <EventListTabs groupId={groupId} events={events ?? []} />
    </>
  );
}
