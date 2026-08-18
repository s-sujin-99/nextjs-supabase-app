"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { parseKstDatetimeLocal } from "@/lib/datetime";

const createEventSchema = z
  .object({
    groupId: z.string().uuid(),
    title: z.string().trim().min(1, "이벤트 제목을 입력해주세요").max(100),
    description: z.string().trim().max(1000).optional(),
    location: z.string().trim().max(200).optional(),
    startsAt: z.string().min(1, "시작 일시를 선택해주세요"),
    endsAt: z.string().optional(),
  })
  .refine((data) => !data.endsAt || data.endsAt >= data.startsAt, {
    message: "종료 일시는 시작 일시 이후여야 합니다",
    path: ["endsAt"],
  });

export async function createEventAction(formData: FormData) {
  const parsed = createEventSchema.safeParse({
    groupId: formData.get("groupId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    location: formData.get("location") || undefined,
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt") || undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요",
    };
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub;
  if (!userId) {
    return { error: "로그인이 필요합니다" };
  }

  const { data: event, error } = await supabase
    .from("events")
    .insert({
      group_id: parsed.data.groupId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      location: parsed.data.location ?? null,
      starts_at: parseKstDatetimeLocal(parsed.data.startsAt),
      ends_at: parsed.data.endsAt
        ? parseKstDatetimeLocal(parsed.data.endsAt)
        : null,
      created_by: userId,
    })
    .select("id")
    .single();

  if (error || !event) {
    return {
      error: "이벤트를 만들지 못했습니다. 주최자만 이벤트를 생성할 수 있습니다",
    };
  }

  revalidatePath(`/groups/${parsed.data.groupId}/events`);
  redirect(`/groups/${parsed.data.groupId}/events/${event.id}`);
}

const rsvpSchema = z.object({
  eventId: z.string().uuid(),
  groupId: z.string().uuid(),
  status: z.enum(["attending", "not_attending"]),
});

export async function submitRsvpAction(formData: FormData) {
  const parsed = rsvpSchema.safeParse({
    eventId: formData.get("eventId"),
    groupId: formData.get("groupId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: "입력값을 확인해주세요" };
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub;
  if (!userId) {
    return { error: "로그인이 필요합니다" };
  }

  const { error } = await supabase.from("event_rsvps").upsert(
    {
      event_id: parsed.data.eventId,
      user_id: userId,
      status: parsed.data.status,
      responded_at: new Date().toISOString(),
    },
    { onConflict: "event_id,user_id" },
  );

  if (error) {
    return { error: "응답을 저장하지 못했습니다" };
  }

  revalidatePath(
    `/groups/${parsed.data.groupId}/events/${parsed.data.eventId}`,
  );
  return { success: true };
}
