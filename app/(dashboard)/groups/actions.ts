"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const createGroupSchema = z.object({
  name: z.string().trim().min(1, "모임 이름을 입력해주세요").max(100),
  description: z.string().trim().max(500).optional(),
});

export async function createGroupAction(formData: FormData) {
  const parsed = createGroupSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_group", {
    p_name: parsed.data.name,
    p_description: parsed.data.description ?? undefined,
  });

  if (error || !data) {
    return { error: "모임을 만들지 못했습니다. 잠시 후 다시 시도해주세요" };
  }

  revalidatePath("/groups");
  redirect(`/groups/${data}`);
}

const joinGroupSchema = z.object({
  code: z.string().trim().min(1, "초대 코드를 입력해주세요"),
});

export async function joinGroupAction(formData: FormData) {
  const parsed = joinGroupSchema.safeParse({ code: formData.get("code") });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("join_group_by_invite_code", {
    p_code: parsed.data.code,
  });

  if (error || !data) {
    return { error: "유효하지 않은 초대 코드입니다" };
  }

  revalidatePath("/groups");
  redirect(`/groups/${data}`);
}
