import { createClient } from "@/lib/supabase/server";
import { NotificationItem } from "@/components/notifications/notification-item";
import { MarkAllReadButton } from "@/components/notifications/mark-all-read-button";

export async function NotificationList() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub;
  if (!userId) return null;

  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, title, body, link_path, is_read, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (!notifications || notifications.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        아직 알림이 없습니다
      </div>
    );
  }

  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <div className="flex flex-col gap-3">
      {hasUnread && (
        <div className="flex justify-end">
          <MarkAllReadButton />
        </div>
      )}
      <div className="flex flex-col gap-2">
        {notifications.map((n) => (
          <NotificationItem key={n.id} notification={n} />
        ))}
      </div>
    </div>
  );
}
