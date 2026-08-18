"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { respondToRequestAction } from "@/app/(dashboard)/groups/[groupId]/events/[eventId]/carpool/actions";

export function RespondButtons({
  groupId,
  eventId,
  offerId,
  requestId,
}: {
  groupId: string;
  eventId: string;
  offerId: string;
  requestId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const respond = (decision: "approved" | "declined") => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("groupId", groupId);
      formData.set("eventId", eventId);
      formData.set("offerId", offerId);
      formData.set("requestId", requestId);
      formData.set("decision", decision);
      const result = await respondToRequestAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => respond("approved")}
        >
          승인
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={isPending}
          onClick={() => respond("declined")}
        >
          거절
        </Button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
