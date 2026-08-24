/**
 * Task 003: Phase 2(더미 데이터 기반 UI) 구현용 목 데이터.
 * Task 007에서 실제 Supabase 조회 로직으로 교체될 예정.
 */

import type {
  EventStatus,
  EventWithParticipants,
  GatherUser,
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

/**
 * Task 008 이전까지는 실제 로그인 세션이 없으므로, 주최자 뷰(Task 004)와
 * 참여자 뷰(Task 005)를 동시에 시연하기 위한 "현재 사용자" 고정값.
 * event-1은 직접 주최하고, event-2/event-3에는 참여자로 등록되어 있으며,
 * event-4는 아직 참여하지 않아 초대 링크 참여(F004) 흐름 시연에 쓰인다.
 */
export const MOCK_CURRENT_USER: GatherUser = MOCK_USERS[0];

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
    participantCount: 3,
    hostIndex: 0,
  },
  {
    id: "event-2",
    title: "프론트엔드 스터디 워크숍",
    description: "Next.js 16 Cache Components 실습 세션",
    location: "강남 스터디룸 3층",
    eventDate: "2026-08-24T10:00:00.000Z",
    status: "ongoing",
    participantCount: 3,
    hostIndex: 1,
  },
  {
    id: "event-3",
    title: "여름 워크샵 뒷풀이",
    description: null,
    location: "홍대 맛집거리",
    eventDate: "2026-07-20T12:00:00.000Z",
    status: "ended",
    participantCount: 3,
    hostIndex: 2,
  },
  {
    id: "event-4",
    title: "가을 보드게임 모임",
    description: "신작 보드게임 같이 해봐요",
    location: "잠실 보드게임 카페",
    eventDate: "2026-10-18T13:00:00.000Z",
    status: "upcoming",
    participantCount: 2,
    hostIndex: 1,
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

function buildParticipants(
  eventId: string,
  hostUser: GatherUser,
  otherUsers: GatherUser[],
): ParticipantWithUser[] {
  return [hostUser, ...otherUsers].map((user, index) => ({
    id: `${eventId}-participant-${index + 1}`,
    eventId,
    userId: user.id,
    role: user.id === hostUser.id ? "host" : "participant",
    joinedAt: user.createdAt,
    user: { id: user.id, name: user.name, avatarUrl: user.avatarUrl },
  }));
}

const [user1, user2, user3] = MOCK_USERS;

/** 이벤트별 참여자 목록. 각 이벤트의 첫 번째 항목이 항상 주최자(host)다. */
const EVENT_PARTICIPANTS: Record<string, ParticipantWithUser[]> = {
  "event-1": buildParticipants("event-1", user1, [user2, user3]),
  "event-2": buildParticipants("event-2", user2, [user1, user3]),
  "event-3": buildParticipants("event-3", user3, [user1, user2]),
  // event-4는 현재 사용자가 아직 참여하지 않은 상태(초대 링크 참여 흐름 시연용)
  "event-4": buildParticipants("event-4", user2, [user3]),
};

export function getMockParticipantsByEventId(
  eventId: string,
): ParticipantWithUser[] {
  return EVENT_PARTICIPANTS[eventId] ?? [];
}

export function isEventHostedByCurrentUser(
  event: Pick<EventWithParticipants, "createdBy">,
): boolean {
  return event.createdBy === MOCK_CURRENT_USER.id;
}

export function hasCurrentUserJoined(eventId: string): boolean {
  return getMockParticipantsByEventId(eventId).some(
    (participant) => participant.userId === MOCK_CURRENT_USER.id,
  );
}

/** 내가 주최했거나 참여한 이벤트만 모은 목록 (F007 "내 이벤트 목록"). */
export function getMyMockEvents(): EventWithParticipants[] {
  return MOCK_EVENTS.filter(
    (event) =>
      isEventHostedByCurrentUser(event) || hasCurrentUserJoined(event.id),
  );
}

/**
 * Task 007 이전까지는 실제 DB 조회가 없으므로, 존재하지 않는 id로 접근해도
 * 화면이 비어 보이지 않도록 첫 번째 목 이벤트로 대체한다.
 */
export function getMockEventById(eventId: string): EventWithParticipants {
  return MOCK_EVENTS.find((event) => event.id === eventId) ?? MOCK_EVENTS[0];
}

/** 초대 코드로 이벤트를 찾는다. 존재하지 않는 코드는 undefined를 반환한다(F004 유효성 검사용). */
export function getMockEventByInviteCode(
  inviteCode: string,
): EventWithParticipants | undefined {
  return MOCK_EVENTS.find(
    (event) => event.inviteCode.toLowerCase() === inviteCode.toLowerCase(),
  );
}
