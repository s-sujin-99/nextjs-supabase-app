/**
 * 로그인 상태 전역 관리용 임시 타입.
 * Task 008에서 실제 Supabase 세션 연동 후 확정될 예정.
 */

import type { GatherUser } from "./gather";

export interface AuthState {
  user: GatherUser | null;
  isLoading: boolean;
}
