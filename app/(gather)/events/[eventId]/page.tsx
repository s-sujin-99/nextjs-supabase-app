import { notFound } from "next/navigation";
import Image from "next/image";
import { Suspense } from "react";
import { CalendarDays, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { LiveParticipantList } from "@/components/gather/live-participant-list";
import { EventDetailActions } from "@/components/gather/event-detail-actions";
import { JoinButton } from "@/components/gather/join-button";
import { EventDetailSkeleton } from "@/components/gather/loading-skeleton";
import {
  getCurrentUserId,
  getEventById,
  getEventParticipants,
} from "@/lib/supabase/gather-queries";
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

async function EventDetailContent({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const [event, participants, currentUserId] = await Promise.all([
    getEventById(eventId),
    getEventParticipants(eventId),
    getCurrentUserId(),
  ]);

  if (!event) {
    notFound();
  }

  const isHost = event.createdBy === currentUserId;
  const isParticipant = participants.some(
    (participant) => participant.userId === currentUserId,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="relative flex h-48 w-full items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
        {event.coverImageUrl ? (
          <Image
            src={event.coverImageUrl}
            alt={event.title}
            fill
            sizes="(min-width: 768px) 448px, 100vw"
            className="rounded-lg object-cover"
            priority
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

      {!isHost && !isParticipant ? (
        <JoinButton
          inviteCode={event.inviteCode}
          eventTitle={event.title}
          isLoggedIn={!!currentUserId}
        />
      ) : null}

      <LiveParticipantList
        eventId={event.id}
        initialParticipants={participants}
      />
    </div>
  );
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  return (
    <Suspense fallback={<EventDetailSkeleton />}>
      <EventDetailContent params={params} />
    </Suspense>
  );
}
