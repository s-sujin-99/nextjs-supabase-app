/**
 * 공통 컴포넌트 Props 타입 (Task 003에서 구현할 컴포넌트가 사용).
 */

import type { ReactNode } from "react";
import type {
  EventStatus,
  EventWithParticipants,
  ParticipantWithUser,
} from "./gather";

export interface EventCardProps {
  event: EventWithParticipants;
  href?: string;
}

export interface ParticipantCardProps {
  participant: ParticipantWithUser;
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export interface StatusFilterOption {
  value: EventStatus | "all";
  label: string;
}
