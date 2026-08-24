/**
 * Task 009: gather_events/gather_event_participants 실 데이터 조회 레이어.
 * lib/mock/gather.ts와 동일한 EventWithParticipants/ParticipantWithUser 형태로
 * 매핑해 반환하므로, 이미 그 타입에 맞춰 작성된 UI 컴포넌트는 그대로 재사용된다.
 */

import { createClient } from "@/lib/supabase/server";
import { getEventStatus } from "@/lib/datetime";
import type {
  EventWithParticipants,
  ParticipantRole,
  ParticipantWithUser,
} from "@/lib/types";

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims.sub ?? null;
}

export async function getEventById(
  eventId: string,
): Promise<EventWithParticipants | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gather_events")
    .select(
      "*, host:profiles!gather_events_created_by_fkey(id, full_name, avatar_url), participants:gather_event_participants(count)",
    )
    .eq("id", eventId)
    .maybeSingle();

  if (error || !data || !data.host) {
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    description: data.description,
    location: data.location,
    eventDate: data.event_date,
    coverImageUrl: data.cover_image_url,
    inviteCode: data.invite_code,
    status: getEventStatus(data.event_date),
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    participantCount: data.participants[0]?.count ?? 0,
    host: {
      id: data.host.id,
      name: data.host.full_name ?? "이름 없음",
      avatarUrl: data.host.avatar_url,
    },
  };
}

export async function getEventByInviteCode(
  inviteCode: string,
): Promise<EventWithParticipants | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gather_events")
    .select("id")
    .ilike("invite_code", inviteCode)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return getEventById(data.id);
}

export async function getEventParticipants(
  eventId: string,
): Promise<ParticipantWithUser[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gather_event_participants")
    .select(
      "id, event_id, user_id, role, joined_at, user:profiles!gather_event_participants_user_id_fkey(id, full_name, avatar_url)",
    )
    .eq("event_id", eventId)
    .order("joined_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data
    .filter((row) => row.user)
    .map((row) => ({
      id: row.id,
      eventId: row.event_id,
      userId: row.user_id,
      role: row.role as ParticipantRole,
      joinedAt: row.joined_at,
      user: {
        id: row.user!.id,
        name: row.user!.full_name ?? "이름 없음",
        avatarUrl: row.user!.avatar_url,
      },
    }));
}
