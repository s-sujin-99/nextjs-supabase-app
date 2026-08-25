/**
 * 관리자 대시보드(F012~F015) 임시 타입 정의.
 * Task 011에서 실제 Supabase 집계 쿼리 결과 타입으로 교체될 예정.
 */

import type { EventStatus, UserRole } from "./gather";

export interface DashboardStats {
  events: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
  };
  users: {
    today: number;
    thisWeek: number;
    total: number;
  };
}

export interface AdminEventRow {
  id: string;
  title: string;
  hostName: string;
  eventDate: string;
  participantCount: number;
  status: EventStatus;
  createdAt: string;
}

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
  eventsCreatedCount: number;
  eventsJoinedCount: number;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export type AnalyticsRange = "7d" | "30d" | "90d";

export interface AnalyticsDataPoint {
  date: string;
  count: number;
}

export interface AnalyticsData {
  range: AnalyticsRange;
  eventTrend: AnalyticsDataPoint[];
  userTrend: AnalyticsDataPoint[];
  summary: {
    totalEvents: number;
    totalUsers: number;
    averageParticipants: number;
  };
}

/** 통계 분석 페이지(F015)가 서버에서 한 번만 받아오는 원본 데이터.
 * range 전환 시 재요청 없이 클라이언트에서 날짜별로 집계한다. */
export interface AdminAnalyticsRawData {
  eventDates: string[];
  userDates: string[];
  totalEvents: number;
  totalUsers: number;
  averageParticipants: number;
}
