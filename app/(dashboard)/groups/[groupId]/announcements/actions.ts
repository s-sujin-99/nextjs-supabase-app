"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const announcementSchema = z.object({
  groupId: z.string().uuid(),
  title: z.string().trim().min(1, "제목을 입력해주세요").max(100),
  content: z.string().trim().min(1, "내용을 입력해주세요").max(2000),
  eventId: z.string().uuid().optional(),
});

export async function createAnnouncementAction(formData: FormData) {
  const parsed = announcementSchema.safeParse({
    groupId: formData.get("groupId"),
    title: formData.get("title"),
    content: formData.get("content"),
    eventId: formData.get("eventId") || undefined,
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

  const { error } = await supabase.from("announcements").insert({
    group_id: parsed.data.groupId,
    event_id: parsed.data.eventId ?? null,
    author_id: userId,
    title: parsed.data.title,
    content: parsed.data.content,
  });

  if (error) {
    return { error: "공지를 만들지 못했습니다. 주최자만 작성할 수 있습니다" };
  }

  // 알림 발송은 부가 기능이므로 실패해도 공지 등록 자체는 성공으로 처리한다
  await supabase.rpc("notify_group", {
    p_group_id: parsed.data.groupId,
    p_type: "announcement",
    p_title: `새 공지: ${parsed.data.title}`,
    p_body: parsed.data.content.slice(0, 100),
    p_link_path: `/groups/${parsed.data.groupId}/announcements`,
  });

  revalidatePath(`/groups/${parsed.data.groupId}/announcements`);
  redirect(`/groups/${parsed.data.groupId}/announcements`);
}

const updateAnnouncementSchema = announcementSchema.extend({
  announcementId: z.string().uuid(),
});

export async function updateAnnouncementAction(formData: FormData) {
  const parsed = updateAnnouncementSchema.safeParse({
    announcementId: formData.get("announcementId"),
    groupId: formData.get("groupId"),
    title: formData.get("title"),
    content: formData.get("content"),
    eventId: formData.get("eventId") || undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("announcements")
    .update({
      event_id: parsed.data.eventId ?? null,
      title: parsed.data.title,
      content: parsed.data.content,
    })
    .eq("id", parsed.data.announcementId);

  if (error) {
    return { error: "공지를 수정하지 못했습니다" };
  }

  revalidatePath(`/groups/${parsed.data.groupId}/announcements`);
  redirect(`/groups/${parsed.data.groupId}/announcements`);
}

const deleteAnnouncementSchema = z.object({
  announcementId: z.string().uuid(),
  groupId: z.string().uuid(),
});

export async function deleteAnnouncementAction(formData: FormData) {
  const parsed = deleteAnnouncementSchema.safeParse({
    announcementId: formData.get("announcementId"),
    groupId: formData.get("groupId"),
  });

  if (!parsed.success) {
    return { error: "입력값을 확인해주세요" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", parsed.data.announcementId);

  if (error) {
    return { error: "공지를 삭제하지 못했습니다" };
  }

  revalidatePath(`/groups/${parsed.data.groupId}/announcements`);
  redirect(`/groups/${parsed.data.groupId}/announcements`);
}
