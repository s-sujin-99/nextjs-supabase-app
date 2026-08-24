"use server";

/**
 * Task 010: 초대 링크 참여(F004) Server Action.
 * 중복 참여 방지는 gather_event_participants(event_id, user_id) UNIQUE 제약에 위임한다.
 */

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type ActionResult<T> = { ok: false; error: string } | ({ ok: true } & T);

const UNIQUE_VIOLATION = "23505";

export async function joinEventAction(
  inviteCode: string,
): Promise<ActionResult<{ eventId: string }>> {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) {
    return { ok: false, error: "로그인이 필요해요" };
  }

  const { data: event, error: eventError } = await supabase
    .from("gather_events")
    .select("id")
    .ilike("invite_code", inviteCode)
    .maybeSingle();

  if (eventError || !event) {
    return { ok: false, error: "유효하지 않은 초대 코드예요" };
  }

  const { error: insertError } = await supabase
    .from("gather_event_participants")
    .insert({ event_id: event.id, user_id: userId, role: "participant" });

  if (insertError && insertError.code !== UNIQUE_VIOLATION) {
    return { ok: false, error: "참여에 실패했어요" };
  }

  revalidatePath(`/events/${event.id}`);
  revalidatePath("/events");
  return { ok: true, eventId: event.id };
}
