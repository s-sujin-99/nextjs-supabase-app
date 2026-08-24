/**
 * Task 006: Phase 2(더미 데이터 기반 관리자 UI) 구현용 목 데이터.
 * Task 011에서 실제 Supabase 집계 쿼리 결과로 교체될 예정.
 */

import type {
  AdminEventRow,
  AdminUserRow,
  AnalyticsData,
  AnalyticsDataPoint,
  AnalyticsRange,
  DashboardStats,
  EventStatus,
  UserRole,
} from "@/lib/types";
import {
  getMockParticipantsByEventId,
  MOCK_EVENTS,
  MOCK_USERS,
} from "./gather";

const EVENT_STATUS_CYCLE: EventStatus[] = ["upcoming", "ongoing", "ended"];

function generateExtraAdminEvents(count: number): AdminEventRow[] {
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    const host = MOCK_USERS[i % MOCK_USERS.length];
    return {
      id: `admin-event-${n}`,
      title: `샘플 이벤트 ${n}`,
      hostName: host.name,
      eventDate: new Date(Date.UTC(2026, 7, 1 + i, 10)).toISOString(),
      participantCount: (i % 15) + 1,
      status: EVENT_STATUS_CYCLE[i % EVENT_STATUS_CYCLE.length],
      createdAt: new Date(Date.UTC(2026, 6, 1 + i, 9)).toISOString(),
    };
  });
}

/** 전체 이벤트 테이블(F013)용 더미 데이터. 실제 4개 이벤트 + 페이지네이션 시연용 샘플 20개 */
export const MOCK_ADMIN_EVENTS: AdminEventRow[] = [
  ...MOCK_EVENTS.map((event) => ({
    id: event.id,
    title: event.title,
    hostName: event.host.name,
    eventDate: event.eventDate,
    participantCount: event.participantCount,
    status: event.status,
    createdAt: event.createdAt,
  })),
  ...generateExtraAdminEvents(20),
];

function generateExtraAdminUsers(count: number): AdminUserRow[] {
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    return {
      id: `admin-user-${n}`,
      name: `참여자 ${n}`,
      email: `user${n}@example.com`,
      avatarUrl: null,
      role: "user" as UserRole,
      createdAt: new Date(Date.UTC(2026, 5, 1 + i, 9)).toISOString(),
      eventsCreatedCount: i % 3,
      eventsJoinedCount: (i % 5) + 1,
    };
  });
}

/** 전체 사용자 테이블(F014)용 더미 데이터. 실제 3명 + 페이지네이션 시연용 샘플 20명 */
export const MOCK_ADMIN_USERS: AdminUserRow[] = [
  ...MOCK_USERS.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    role: user.role,
    createdAt: user.createdAt,
    eventsCreatedCount: MOCK_EVENTS.filter(
      (event) => event.createdBy === user.id,
    ).length,
    eventsJoinedCount: MOCK_EVENTS.filter(
      (event) =>
        event.createdBy !== user.id &&
        getMockParticipantsByEventId(event.id).some(
          (participant) => participant.userId === user.id,
        ),
    ).length,
  })),
  ...generateExtraAdminUsers(20),
];

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  events: {
    today: 1,
    thisWeek: 4,
    thisMonth: 12,
    total: MOCK_ADMIN_EVENTS.length,
  },
  users: {
    today: 2,
    thisWeek: 6,
    total: MOCK_ADMIN_USERS.length,
  },
};

const RANGE_DAYS: Record<AnalyticsRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

function generateTrend(days: number, seed: number): AnalyticsDataPoint[] {
  const today = new Date("2026-08-24T00:00:00.000Z");
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() - (days - 1 - i));
    const wave = Math.abs(Math.sin((i + seed) / 3));
    return {
      date: date.toISOString().slice(0, 10),
      count: Math.round(wave * 8) + 1,
    };
  });
}

/** 통계 분석 페이지(F015)용 더미 추이 데이터 */
export function getMockAnalyticsData(range: AnalyticsRange): AnalyticsData {
  const days = RANGE_DAYS[range];
  const eventTrend = generateTrend(days, 1);
  const userTrend = generateTrend(days, 2);
  const totalParticipants = MOCK_ADMIN_EVENTS.reduce(
    (sum, event) => sum + event.participantCount,
    0,
  );

  return {
    range,
    eventTrend,
    userTrend,
    summary: {
      totalEvents: MOCK_ADMIN_EVENTS.length,
      totalUsers: MOCK_ADMIN_USERS.length,
      averageParticipants:
        Math.round((totalParticipants / MOCK_ADMIN_EVENTS.length) * 10) / 10,
    },
  };
}
