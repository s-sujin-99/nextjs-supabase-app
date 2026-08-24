import { Suspense } from "react";

import { EventForm } from "@/components/gather/event-form";
import { getMockEventById } from "@/lib/mock/gather";
import { toDatetimeLocalValue } from "@/lib/datetime";

// Task 009: 이벤트 수정/삭제 API(F006) + 실제 주최자 권한 체크 연동 예정
async function EditEventContent({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = getMockEventById(eventId);

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
