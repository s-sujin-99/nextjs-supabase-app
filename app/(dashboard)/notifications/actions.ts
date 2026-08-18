"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const notificationIdSchema = z.string().uuid();

export async function markNotificationReadAction(notificationId: string) {
  const parsed = notificationIdSchema.safeParse(notificationId);
  if (!parsed.success) return;

  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", parsed.data);

  revalidatePath("/notifications");
}

export async function markAllNotificationsReadAction() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub;
  if (!userId) return;

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  revalidatePath("/notifications");
}
