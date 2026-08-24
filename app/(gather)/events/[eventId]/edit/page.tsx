import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { EventForm } from "@/components/gather/event-form";
import { getCurrentUserId, getEventById } from "@/lib/supabase/gather-queries";
import { toDatetimeLocalValue } from "@/lib/datetime";

async function EditEventContent({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const [event, currentUserId] = await Promise.all([
    getEventById(eventId),
    getCurrentUserId(),
  ]);

  if (!event) {
    notFound();
  }
  if (event.createdBy !== currentUserId) {
    redirect(`/events/${eventId}`);
  }

  return (
    <EventForm
      mode="edit"
      eventId={event.id}
      defaultCoverImageUrl={event.coverImageUrl}
      defaultValues={{
        title: event.title,
        description: event.description ?? "",
        eventDate: toDatetimeLocalValue(event.eventDate),
        location: event.location,
      }}
    />
  );
}

export default function EditEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">이벤트 수정</h1>
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        }
      >
        <EditEventContent params={params} />
      </Suspense>
    </div>
  );
}
