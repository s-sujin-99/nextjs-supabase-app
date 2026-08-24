/**
 * Task 009/010: gather_events/gather_event_participants 실 데이터 조회 레이어.
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

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  location: string;
  event_date: string;
  cover_image_url: string | null;
  invite_code: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  host: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  participants: { count: number }[];
};

const EVENT_SELECT =
  "id, title, description, location, event_date, cover_image_url, invite_code, created_by, created_at, updated_at, host:profiles!gather_events_created_by_fkey(id, full_name, avatar_url), participants:gather_event_participants(count)";

function mapEventRow(row: EventRow): EventWithParticipants | null {
  if (!row.host) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.location,
    eventDate: row.event_date,
    coverImageUrl: row.cover_image_url,
    inviteCode: row.invite_code,
    status: getEventStatus(row.event_date),
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    participantCount: row.participants[0]?.count ?? 0,
    host: {
      id: row.host.id,
      name: row.host.full_name ?? "이름 없음",
      avatarUrl: row.host.avatar_url,
    },
  };
}

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
    .select(EVENT_SELECT)
    .eq("id", eventId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapEventRow(data);
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

export interface EventPreview {
  id: string;
  title: string;
  description: string | null;
  location: string;
  eventDate: string;
  coverImageUrl: string | null;
  host: { name: string; avatarUrl: string | null };
}

/**
 * 비로그인 사용자용 초대 미리보기(F004). gather_events/profiles의 authenticated 전용
 * RLS를 우회하는 SECURITY DEFINER RPC(gather_get_event_preview)를 사용하므로,
 * 로그인 여부와 무관하게 호출 가능하다.
 */
export async function getEventPreviewByInviteCode(
  inviteCode: string,
): Promise<EventPreview | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("gather_get_event_preview", {
    p_invite_code: inviteCode,
  });

  if (error || !data || data.length === 0) {
    return null;
  }

  const row = data[0];
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.location,
    eventDate: row.event_date,
    coverImageUrl: row.cover_image_url,
    host: {
      name: row.host_name ?? "이름 없음",
      avatarUrl: row.host_avatar_url,
    },
  };
}

/** 내가 주최했거나 참여한 이벤트 목록 (F007). 주최자도 gather_event_participants에
 * host role로 등록되어 있으므로(Task 009), 참여자 테이블 한 곳만 조회하면 된다. */
export async function getMyEvents(
  userId: string,
): Promise<EventWithParticipants[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gather_event_participants")
    .select(`joined_at, event:gather_events(${EVENT_SELECT})`)
    .eq("user_id", userId)
    .order("joined_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data
    .map((row) => (row.event ? mapEventRow(row.event) : null))
    .filter((event): event is EventWithParticipants => event !== null);
}

export async function hasUserJoinedEvent(
  eventId: string,
  userId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("gather_event_participants")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .maybeSingle();

  return !!data;
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
