import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Skeleton } from "@/components/ui/skeleton";
import { RsvpWidget } from "@/components/events/rsvp-widget";
import { ParticipantList } from "@/components/events/participant-list";

export default function EventOverviewPage({
  params,
}: {
  params: Promise<{ groupId: string; eventId: string }>;
}) {
  return (
    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
      <EventOverview params={params} />
    </Suspense>
  );
}

async function EventOverview({
  params,
}: {
  params: Promise<{ groupId: string; eventId: string }>;
}) {
  const { groupId, eventId } = await params;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub;

  const rsvpResult = userId
    ? await supabase
        .from("event_rsvps")
        .select("status")
        .eq("event_id", eventId)
        .eq("user_id", userId)
        .maybeSingle()
    : { data: null };

  return (
    <div className="flex flex-col gap-6">
      <RsvpWidget
        groupId={groupId}
        eventId={eventId}
        currentStatus={
          (rsvpResult.data?.status as
            "attending" | "not_attending" | "pending" | undefined) ?? "pending"
        }
      />
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <ParticipantList groupId={groupId} eventId={eventId} />
      </Suspense>
    </div>
  );
}
