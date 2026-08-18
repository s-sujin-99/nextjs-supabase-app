"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { submitRsvpAction } from "@/app/(dashboard)/groups/[groupId]/events/actions";

type Status = "attending" | "not_attending" | "pending";

export function RsvpWidget({
  groupId,
  eventId,
  currentStatus,
}: {
  groupId: string;
  eventId: string;
  currentStatus: Status;
}) {
  const [status, setStatus] = useState<Status>(currentStatus);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleRespond = (next: "attending" | "not_attending") => {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("eventId", eventId);
      formData.set("groupId", groupId);
      formData.set("status", next);

      const result = await submitRsvpAction(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setStatus(next);
      }
    });
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border p-4">
      <p className="text-sm font-medium">참석 여부</p>
      <div className="flex gap-2">
        <Button
          variant={status === "attending" ? "default" : "outline"}
          disabled={isPending}
          onClick={() => handleRespond("attending")}
        >
          참석
        </Button>
        <Button
          variant={status === "not_attending" ? "default" : "outline"}
          disabled={isPending}
          onClick={() => handleRespond("not_attending")}
        >
          불참
        </Button>
      </div>
      {status === "pending" && (
        <p className="text-xs text-muted-foreground">
          아직 응답하지 않았습니다
        </p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
