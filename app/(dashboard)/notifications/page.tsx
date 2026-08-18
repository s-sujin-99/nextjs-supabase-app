import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationList } from "@/components/notifications/notification-list";

export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">알림</h1>
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <NotificationList />
      </Suspense>
    </div>
  );
}
