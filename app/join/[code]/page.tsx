import { Suspense } from "react";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { JoinButton } from "@/components/gather/join-button";
import {
  getCurrentUserId,
  getEventPreviewByInviteCode,
  hasUserJoinedEvent,
} from "@/lib/supabase/gather-queries";

function formatEventDate(isoDate: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

async function JoinContent({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const [event, currentUserId] = await Promise.all([
    getEventPreviewByInviteCode(code),
    getCurrentUserId(),
  ]);

  if (!event) {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="font-medium">유효하지 않은 초대 코드예요</p>
        <p className="text-sm text-muted-foreground">
          링크를 다시 확인하거나 주최자에게 새 초대 링크를 요청해주세요.
        </p>
      </div>
    );
  }

  const alreadyJoined = currentUserId
    ? await hasUserJoinedEvent(event.id, currentUserId)
    : false;

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex h-40 w-full items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
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

      <div className="flex flex-col gap-2 text-left">
        <h2 className="text-xl font-semibold">{event.title}</h2>
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
        <div className="flex items-center gap-2 pt-1">
          <Avatar size="sm">
            <AvatarImage
              src={event.host.avatarUrl ?? undefined}
              alt={event.host.name}
            />
            <AvatarFallback>{event.host.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">
            {event.host.name}님이 주최해요
          </span>
        </div>
      </div>

      {alreadyJoined ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            이미 참여한 이벤트예요.
          </p>
          <Button size="lg" className="w-full" asChild>
            <Link href={`/events/${event.id}`}>이벤트 보러 가기</Link>
          </Button>
        </div>
      ) : (
        <JoinButton
          inviteCode={code}
          eventTitle={event.title}
          isLoggedIn={!!currentUserId}
        />
      )}
    </div>
  );
}

export default function JoinEventPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-4 p-5 text-center">
      <h1 className="text-2xl font-semibold">이벤트 초대</h1>
      <Suspense
        fallback={
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        }
      >
        <JoinContent params={params} />
      </Suspense>
    </main>
  );
}
