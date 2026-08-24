import { Suspense } from "react";
import { CalendarDays, MapPin, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ParticipantCard } from "@/components/gather/participant-card";
import { EventDetailActions } from "@/components/gather/event-detail-actions";
import {
  getMockEventById,
  getMockParticipantsByEventId,
  isEventHostedByCurrentUser,
} from "@/lib/mock/gather";
import type { EventStatus } from "@/lib/types";

const STATUS_LABEL: Record<EventStatus, string> = {
  upcoming: "예정",
  ongoing: "진행 중",
  ended: "종료",
};

function formatEventDate(isoDate: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

// Task 007/009: Supabase에서 이벤트/참여자 실데이터 조회 및 실시간 구독(F005)으로 교체 예정
async function EventDetailContent({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const event = getMockEventById(eventId);
  const participants = getMockParticipantsByEventId(event.id);
  const isHost = isEventHostedByCurrentUser(event);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex h-48 w-full items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
        {event.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.coverImageUrl}
            alt={event.title}
            className="h-full w-full rounded-lg object-cover"
          />
        ) : (
          "커버 이미지 없음"
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-2xl font-semibold">{event.title}</h1>
          <Badge>{STATUS_LABEL[event.status]}</Badge>
        </div>
        {event.description ? (
          <p className="text-sm text-muted-foreground">{event.description}</p>
        ) : null}
        <div className="flex flex-col gap-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4" />
            {formatEventDate(event.eventDate)}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-4" />
            {event.location}
          </div>
        </div>
      </div>

      <EventDetailActions
        eventId={event.id}
        eventTitle={event.title}
        inviteCode={event.inviteCode}
        isHost={isHost}
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Users className="size-4" />
          참여자 {participants.length}명
        </div>
        <div className="flex flex-col gap-2">
          {participants.map((participant) => (
            <ParticipantCard key={participant.id} participant={participant} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  return (
    <Suspense
      fallback={<p className="text-sm text-muted-foreground">불러오는 중...</p>}
    >
      <EventDetailContent params={params} />
    </Suspense>
  );
}
