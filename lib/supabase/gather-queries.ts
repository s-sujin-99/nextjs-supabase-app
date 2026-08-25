/**
 * Task 009/010: gather_events/gather_event_participants 실 데이터 조회 레이어.
 * lib/mock/gather.ts와 동일한 EventWithParticipants/ParticipantWithUser 형태로
 * 매핑해 반환하므로, 이미 그 타입에 맞춰 작성된 UI 컴포넌트는 그대로 재사용된다.
 */

import { createClient } from "@/lib/supabase/server";
import {
  getEventStatus,
  toKstDateKey,
  toKstMonthKey,
  toKstWeekStartKey,
} from "@/lib/datetime";
import type {
  AdminAnalyticsRawData,
  AdminEventRow,
  AdminUserRow,
  DashboardStats,
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

/**
 * Task 011: 관리자 대시보드(F012~F015) 조회 레이어.
 * profiles의 관리자 전체 조회 RLS(gather_profiles_select_admin)에 의존하므로,
 * admin role이 아닌 사용자가 호출하면 빈 배열/0으로 채워진 값이 반환된다
 * (에러가 아니라 RLS가 조용히 행을 걸러내는 정상 동작).
 */

type AdminEventQueryRow = {
  id: string;
  title: string;
  event_date: string;
  created_at: string;
  host: { full_name: string | null } | null;
  participants: { count: number }[];
};

const ADMIN_EVENT_SELECT =
  "id, title, event_date, created_at, host:profiles!gather_events_created_by_fkey(full_name), participants:gather_event_participants(count)";

/** 이벤트 관리 테이블(F013)용 전체 이벤트 목록. 검색/필터/정렬/페이지네이션은
 * 소규모 데이터셋 전제하에 AdminEventsTable에서 클라이언트 사이드로 처리한다. */
export async function getAdminEvents(): Promise<AdminEventRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gather_events")
    .select(ADMIN_EVENT_SELECT)
    .order("event_date", { ascending: false });

  if (error || !data) {
    return [];
  }

  return (data as AdminEventQueryRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    hostName: row.host?.full_name ?? "이름 없음",
    eventDate: row.event_date,
    participantCount: row.participants[0]?.count ?? 0,
    status: getEventStatus(row.event_date),
    createdAt: row.created_at,
  }));
}

/** 사용자 관리 테이블(F014)용 전체 사용자 목록 + 생성/참여 이벤트 수. */
export async function getAdminUsers(): Promise<AdminUserRow[]> {
  const supabase = await createClient();
  const [
    { data: users, error: usersError },
    { data: hostedRows },
    { data: participantRows },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, role, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("gather_events").select("created_by"),
    supabase.from("gather_event_participants").select("user_id, role"),
  ]);

  if (usersError || !users) {
    return [];
  }

  const hostedCountMap = new Map<string, number>();
  for (const row of hostedRows ?? []) {
    hostedCountMap.set(
      row.created_by,
      (hostedCountMap.get(row.created_by) ?? 0) + 1,
    );
  }

  // 주최자도 host role로 gather_event_participants에 등록되므로(Task 009),
  // participant role만 세면 "만든 이벤트를 제외한 참여 이벤트 수"가 된다.
  const joinedCountMap = new Map<string, number>();
  for (const row of participantRows ?? []) {
    if (row.role !== "participant") continue;
    joinedCountMap.set(row.user_id, (joinedCountMap.get(row.user_id) ?? 0) + 1);
  }

  return users.map((user) => ({
    id: user.id,
    name: user.full_name ?? user.email,
    email: user.email,
    avatarUrl: user.avatar_url,
    role: user.role === "admin" ? "admin" : "user",
    createdAt: user.created_at,
    eventsCreatedCount: hostedCountMap.get(user.id) ?? 0,
    eventsJoinedCount: joinedCountMap.get(user.id) ?? 0,
  }));
}

/** 대시보드 지표(F012). "오늘/이번 주/이번 달"은 KST 달력 기준으로 판단한다. */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const [{ data: events }, { data: users }] = await Promise.all([
    supabase.from("gather_events").select("created_at"),
    supabase.from("profiles").select("created_at"),
  ]);

  const now = new Date();
  const todayKey = toKstDateKey(now);
  const weekStartKey = toKstWeekStartKey(now);
  const monthKey = toKstMonthKey(now);

  const eventDates = (events ?? []).map((row) => row.created_at);
  const userDates = (users ?? []).map((row) => row.created_at);

  return {
    events: {
      today: eventDates.filter((d) => toKstDateKey(new Date(d)) === todayKey)
        .length,
      thisWeek: eventDates.filter(
        (d) => toKstWeekStartKey(new Date(d)) === weekStartKey,
      ).length,
      thisMonth: eventDates.filter(
        (d) => toKstMonthKey(new Date(d)) === monthKey,
      ).length,
      total: eventDates.length,
    },
    users: {
      today: userDates.filter((d) => toKstDateKey(new Date(d)) === todayKey)
        .length,
      thisWeek: userDates.filter(
        (d) => toKstWeekStartKey(new Date(d)) === weekStartKey,
      ).length,
      total: userDates.length,
    },
  };
}

/** 통계 분석 페이지(F015)용 원본 데이터. 날짜별 집계는 클라이언트에서 range에
 * 맞춰 계산하므로(AdminAnalyticsCharts), 여기서는 원시 생성일시만 반환한다. */
export async function getAdminAnalyticsRawData(): Promise<AdminAnalyticsRawData> {
  const supabase = await createClient();
  const [{ data: events }, { data: users }, { count: participantCount }] =
    await Promise.all([
      supabase.from("gather_events").select("created_at"),
      supabase.from("profiles").select("created_at"),
      supabase
        .from("gather_event_participants")
        .select("id", { count: "exact", head: true }),
    ]);

  const totalEvents = events?.length ?? 0;
  const totalUsers = users?.length ?? 0;
  const averageParticipants =
    totalEvents === 0
      ? 0
      : Math.round(((participantCount ?? 0) / totalEvents) * 10) / 10;

  return {
    eventDates: (events ?? []).map((row) => row.created_at),
    userDates: (users ?? []).map((row) => row.created_at),
    totalEvents,
    totalUsers,
    averageParticipants,
  };
}
