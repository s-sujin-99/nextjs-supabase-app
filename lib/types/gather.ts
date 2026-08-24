/**
 * Gather 도메인 임시 타입 정의.
 *
 * Task 007에서 Supabase 스키마 확정 후 `lib/supabase/database.types.ts` 기반
 * 타입으로 교체될 예정 (docs/PRD.md "데이터 모델" 섹션 기준).
 */

export type UserRole = "user" | "admin";

export type EventStatus = "upcoming" | "ongoing" | "ended";

export type ParticipantRole = "host" | "participant";

export interface GatherUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface GatherEvent {
  id: string;
  title: string;
  description: string | null;
  location: string;
  eventDate: string;
  coverImageUrl: string | null;
  inviteCode: string;
  status: EventStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  role: ParticipantRole;
  joinedAt: string;
}

/** 이벤트 카드/상세에서 참여자 수·주최자 정보까지 함께 표시할 때 쓰는 합성 타입 */
export interface EventWithParticipants extends GatherEvent {
  participantCount: number;
  host: Pick<GatherUser, "id" | "name" | "avatarUrl">;
}

/** 참여자 목록에서 프로필과 함께 표시할 때 쓰는 합성 타입 */
export interface ParticipantWithUser extends EventParticipant {
  user: Pick<GatherUser, "id" | "name" | "avatarUrl">;
}
