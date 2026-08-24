"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";

import { ParticipantCard } from "@/components/gather/participant-card";
import { createClient } from "@/lib/supabase/client";
import type { ParticipantRole, ParticipantWithUser } from "@/lib/types";

/**
 * Task 010: gather_event_participants Realtime 구독(F005 실시간 참여자 카운트).
 * INSERT/DELETE 페이로드는 원본 행만 담고 있어, 새 참여자가 들어오면
 * profiles를 한 번 더 조회해 이름/아바타를 채운다.
 *
 * RLS가 걸린 테이블을 구독하려면 WebSocket 연결에 현재 세션의 access token이
 * 명시적으로 실려 있어야 한다(supabase.realtime.setAuth). 이걸 빼먹으면 채널은
 * SUBSCRIBED로 성공하지만 authenticated 전용 정책 때문에 payload가 조용히
 * 전달되지 않는다. 또한 이 테이블은 REPLICA IDENTITY FULL로 설정돼 있어야
 * DELETE payload.old에 event_id가 포함된다(기본값은 PK만 포함해 필터가 매치되지 않음).
 */
export function LiveParticipantList({
  eventId,
  initialParticipants,
}: {
  eventId: string;
  initialParticipants: ParticipantWithUser[];
}) {
  const [participants, setParticipants] = useState(initialParticipants);

  useEffect(() => {
    setParticipants(initialParticipants);
  }, [initialParticipants]);

  useEffect(() => {
    const supabase = createClient();
    let isCancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isCancelled || !session) return;
      supabase.realtime.setAuth(session.access_token);

      channel = supabase
        .channel(`gather-event-participants-${eventId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "gather_event_participants",
            filter: `event_id=eq.${eventId}`,
          },
          async (payload) => {
            const row = payload.new as {
              id: string;
              user_id: string;
              role: ParticipantRole;
              joined_at: string;
            };

            const { data: profile } = await supabase
              .from("profiles")
              .select("id, full_name, avatar_url")
              .eq("id", row.user_id)
              .maybeSingle();

            setParticipants((prev) =>
              prev.some((p) => p.id === row.id)
                ? prev
                : [
                    ...prev,
                    {
                      id: row.id,
                      eventId,
                      userId: row.user_id,
                      role: row.role,
                      joinedAt: row.joined_at,
                      user: {
                        id: row.user_id,
                        name: profile?.full_name ?? "이름 없음",
                        avatarUrl: profile?.avatar_url ?? null,
                      },
                    },
                  ],
            );
          },
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "gather_event_participants",
            filter: `event_id=eq.${eventId}`,
          },
          (payload) => {
            const row = payload.old as { id: string };
            setParticipants((prev) => prev.filter((p) => p.id !== row.id));
          },
        )
        .subscribe();
    });

    return () => {
      isCancelled = true;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [eventId]);

  return (
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
  );
}
