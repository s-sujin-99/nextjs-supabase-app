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
