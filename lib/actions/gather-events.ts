"use server";

/**
 * Task 009: 이벤트 생성/수정/삭제(F001, F006) + 커버 이미지 업로드(F009) Server Actions.
 * invite_code는 gather_events 테이블의 DB 기본값(gen_random_bytes 기반)이 자동 생성하므로
 * 별도 라이브러리 없이 그대로 위임한다.
 */

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

type ActionResult<T> = { ok: false; error: string } | ({ ok: true } & T);

async function requireUserId(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string | null> {
  const { data } = await supabase.auth.getClaims();
  return data?.claims.sub ?? null;
}

function readEventFields(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    eventDate: String(formData.get("eventDate") ?? ""),
    location: String(formData.get("location") ?? "").trim(),
    cover: formData.get("cover"),
  };
}

async function uploadCoverImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  eventId: string,
  file: File,
): Promise<string | null> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${eventId}.${ext}`;

  const { error } = await supabase.storage
    .from("event-covers")
    .upload(path, file, { upsert: true });

  if (error) {
    return null;
  }

  return supabase.storage.from("event-covers").getPublicUrl(path).data
    .publicUrl;
}

export async function createEventAction(
  formData: FormData,
): Promise<ActionResult<{ eventId: string }>> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);
  if (!userId) {
    return { ok: false, error: "로그인이 필요해요" };
  }

  const { title, description, eventDate, location, cover } =
    readEventFields(formData);
  if (!title || !eventDate || !location) {
    return { ok: false, error: "필수 항목을 모두 입력해주세요" };
  }

  const { data: event, error: insertError } = await supabase
    .from("gather_events")
    .insert({
      title,
      description: description || null,
      event_date: eventDate,
      location,
      created_by: userId,
    })
    .select("id")
    .single();

  if (insertError || !event) {
    return { ok: false, error: "이벤트 생성에 실패했어요" };
  }

  const { error: participantError } = await supabase
    .from("gather_event_participants")
    .insert({ event_id: event.id, user_id: userId, role: "host" });

  if (participantError) {
    // 주최자 참여자 행 생성에 실패하면 이벤트만 남는 불일치 상태를 방지한다.
    await supabase.from("gather_events").delete().eq("id", event.id);
    return { ok: false, error: "이벤트 생성에 실패했어요" };
  }

  if (cover instanceof File && cover.size > 0) {
    const coverUrl = await uploadCoverImage(supabase, userId, event.id, cover);
    if (coverUrl) {
      await supabase
        .from("gather_events")
        .update({ cover_image_url: coverUrl })
        .eq("id", event.id);
    }
  }

  revalidatePath("/events");
  return { ok: true, eventId: event.id };
}

export async function updateEventAction(
  eventId: string,
  formData: FormData,
): Promise<ActionResult<{ eventId: string }>> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);
  if (!userId) {
    return { ok: false, error: "로그인이 필요해요" };
  }

  const { title, description, eventDate, location, cover } =
    readEventFields(formData);
  if (!title || !eventDate || !location) {
    return { ok: false, error: "필수 항목을 모두 입력해주세요" };
  }

  let coverImageUrl: string | undefined;
  if (cover instanceof File && cover.size > 0) {
    const uploaded = await uploadCoverImage(supabase, userId, eventId, cover);
    if (uploaded) {
      coverImageUrl = uploaded;
    }
  }

  const { data: updated, error } = await supabase
    .from("gather_events")
    .update({
      title,
      description: description || null,
      event_date: eventDate,
      location,
      ...(coverImageUrl ? { cover_image_url: coverImageUrl } : {}),
    })
    .eq("id", eventId)
    .select("id");

  if (error) {
    return { ok: false, error: "이벤트 수정에 실패했어요" };
  }
  if (!updated || updated.length === 0) {
    return { ok: false, error: "주최자만 수정할 수 있어요" };
  }

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");
  return { ok: true, eventId };
}

export async function deleteEventAction(
  eventId: string,
): Promise<ActionResult<{ success: true }>> {
  const supabase = await createClient();
  const userId = await requireUserId(supabase);
  if (!userId) {
    return { ok: false, error: "로그인이 필요해요" };
  }

  const { data: deleted, error } = await supabase
    .from("gather_events")
    .delete()
    .eq("id", eventId)
    .select("id");

  if (error) {
    return { ok: false, error: "이벤트 삭제에 실패했어요" };
  }
  if (!deleted || deleted.length === 0) {
    return { ok: false, error: "주최자 또는 관리자만 삭제할 수 있어요" };
  }

  revalidatePath("/events");
  return { ok: true, success: true as const };
}
