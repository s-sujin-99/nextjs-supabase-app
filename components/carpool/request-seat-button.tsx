"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { requestSeatAction } from "@/app/(dashboard)/groups/[groupId]/events/[eventId]/carpool/actions";

export function RequestSeatButton({
  groupId,
  eventId,
  offerId,
}: {
  groupId: string;
  eventId: string;
  offerId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("groupId", groupId);
      formData.set("eventId", eventId);
      formData.set("offerId", offerId);
      const result = await requestSeatAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button size="sm" disabled={isPending} onClick={handleClick}>
        {isPending ? "신청 중..." : "탑승 신청"}
      </Button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
