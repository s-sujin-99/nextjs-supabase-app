"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { markAllNotificationsReadAction } from "@/app/(dashboard)/notifications/actions";

export function MarkAllReadButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(() => markAllNotificationsReadAction())}
    >
      모두 읽음으로 표시
    </Button>
  );
}
