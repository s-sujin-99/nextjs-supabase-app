"use client";

import { useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { markSharePaidAction } from "@/app/(dashboard)/groups/[groupId]/events/[eventId]/settlement/actions";

export function PaidCheckbox({
  groupId,
  eventId,
  shareId,
  isPaid,
  disabled,
}: {
  groupId: string;
  eventId: string;
  shareId: string;
  isPaid: boolean;
  disabled: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (checked: boolean) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("groupId", groupId);
      formData.set("eventId", eventId);
      formData.set("shareId", shareId);
      formData.set("isPaid", String(checked));
      await markSharePaidAction(formData);
    });
  };

  return (
    <Checkbox
      checked={isPaid}
      disabled={disabled || isPending}
      onCheckedChange={(checked) => handleChange(checked === true)}
    />
  );
}
