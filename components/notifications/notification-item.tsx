"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { markNotificationReadAction } from "@/app/(dashboard)/notifications/actions";

type Notification = {
  id: string;
  title: string;
  body: string | null;
  link_path: string | null;
  is_read: boolean;
  created_at: string;
};

export function NotificationItem({
  notification,
}: {
  notification: Notification;
}) {
  const handleClick = () => {
    if (!notification.is_read) {
      markNotificationReadAction(notification.id);
    }
  };

  const content = (
    <div
      className={cn(
        "rounded-md border p-3 transition-colors",
        notification.is_read ? "bg-background" : "bg-accent",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{notification.title}</p>
        {!notification.is_read && (
          <span className="size-2 shrink-0 rounded-full bg-primary" />
        )}
      </div>
      {notification.body && (
        <p className="mt-1 text-sm text-muted-foreground">
          {notification.body}
        </p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">
        {new Date(notification.created_at).toLocaleString("ko-KR", {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Asia/Seoul",
        })}
      </p>
    </div>
  );

  if (notification.link_path) {
    return (
      <Link href={notification.link_path} onClick={handleClick}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={handleClick} className="w-full text-left">
      {content}
    </button>
  );
}
