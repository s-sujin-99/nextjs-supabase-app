/**
 * Task 003: Phase 2(더미 데이터 기반 UI) 구현용 목 데이터.
 * Task 007에서 실제 Supabase 조회 로직으로 교체될 예정.
 */

import type {
  EventStatus,
  EventWithParticipants,
  GatherUser,
  ParticipantRole,
  ParticipantWithUser,
} from "@/lib/types";

export const MOCK_USERS: GatherUser[] = [
  {
    id: "user-1",
    email: "jiwoo@example.com",
    name: "김지우",
    avatarUrl: null,
    role: "admin",
    createdAt: "2026-06-01T09:00:00.000Z",
    updatedAt: "2026-06-01T09:00:00.000Z",
  },
  {
    id: "user-2",
    email: "minjun@example.com",
    name: "이민준",
    avatarUrl: null,
    role: "user",
    createdAt: "2026-06-05T09:00:00.000Z",
    updatedAt: "2026-06-05T09:00:00.000Z",
  },
  {
    id: "user-3",
    email: "seoyeon@example.com",
    name: "박서연",
    avatarUrl: null,
    role: "user",
    createdAt: "2026-06-10T09:00:00.000Z",
    updatedAt: "2026-06-10T09:00:00.000Z",
  },
];

const EVENT_TEMPLATES: Array<{
  id: string;
  title: string;
  description: string | null;
  location: string;
  eventDate: string;
  status: EventStatus;
  participantCount: number;
  hostIndex: number;
}> = [
  {
    id: "event-1",
    title: "지우 생일 파티",
    description: "다 같이 모여서 케이크 자르고 놀아요!",
    location: "서울 마포구 연남동 파티룸",
    eventDate: "2026-09-05T19:00:00.000Z",
    status: "upcoming",
    participantCount: 12,
    hostIndex: 0,
  },
  {
    id: "event-2",
    title: "프론트엔드 스터디 워크숍",
    description: "Next.js 16 Cache Components 실습 세션",
    location: "강남 스터디룸 3층",
    eventDate: "2026-08-24T10:00:00.000Z",
    status: "ongoing",
    participantCount: 8,
    hostIndex: 1,
  },
  {
    id: "event-3",
    title: "여름 워크샵 뒷풀이",
    description: null,
    location: "홍대 맛집거리",
    eventDate: "2026-07-20T12:00:00.000Z",
    status: "ended",
    participantCount: 20,
    hostIndex: 2,
  },
];

export const MOCK_EVENTS: EventWithParticipants[] = EVENT_TEMPLATES.map(
  (template) => {
    const host = MOCK_USERS[template.hostIndex];
    return {
      id: template.id,
      title: template.title,
      description: template.description,
      location: template.location,
      eventDate: template.eventDate,
      coverImageUrl: null,
      inviteCode: template.id.toUpperCase().replace("-", ""),
      status: template.status,
      createdBy: host.id,
      createdAt: template.eventDate,
      updatedAt: template.eventDate,
      participantCount: template.participantCount,
      host: { id: host.id, name: host.name, avatarUrl: host.avatarUrl },
    };
  },
);

const PARTICIPANT_ROLES: ParticipantRole[] = ["host", "participant"];

export const MOCK_PARTICIPANTS: ParticipantWithUser[] = MOCK_USERS.map(
  (user, index) => ({
    id: `participant-${index + 1}`,
    eventId: MOCK_EVENTS[0].id,
    userId: user.id,
    role: PARTICIPANT_ROLES[index === 0 ? 0 : 1],
    joinedAt: user.createdAt,
    user: { id: user.id, name: user.name, avatarUrl: user.avatarUrl },
  }),
);
