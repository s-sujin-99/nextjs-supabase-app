/**
 * Server Action / API 응답 공통 타입.
 * Task 009~011에서 실제 Server Action 반환 타입으로 사용될 예정.
 */

export type ActionResult<T> =
  { success: true; data: T } | { success: false; error: string };
