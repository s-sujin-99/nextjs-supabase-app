"use server";

/**
 * Task 011: 관리자 사용자 관리(F014) Server Action.
 * profiles.id -> gather_events.created_by / gather_event_participants.user_id는
 * ON DELETE CASCADE이므로, 사용자를 삭제하면 그 사용자가 만든 이벤트와 참여 기록도
 * 함께 삭제된다 (auth.users 계정 자체는 service role 키가 없어 남아있음 — 재로그인 시
 * profiles 행 없이 접근하게 되는 한계는 이번 Task 범위 밖).
 */

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type ActionResult<T> = { ok: false; error: string } | ({ ok: true } & T);

export async function deleteUserAction(
  userId: string,
): Promise<ActionResult<{ success: true }>> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const currentUserId = claims?.claims.sub;
  if (!currentUserId) {
    return { ok: false, error: "로그인이 필요해요" };
  }
  if (currentUserId === userId) {
    return { ok: false, error: "자신은 삭제할 수 없어요" };
  }

  const { data: deleted, error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId)
    .select("id");

  if (error) {
    return { ok: false, error: "사용자 삭제에 실패했어요" };
  }
  if (!deleted || deleted.length === 0) {
    return { ok: false, error: "관리자만 삭제할 수 있어요" };
  }

  revalidatePath("/admin/users");
  revalidatePath("/admin/dashboard");
  return { ok: true, success: true as const };
}
