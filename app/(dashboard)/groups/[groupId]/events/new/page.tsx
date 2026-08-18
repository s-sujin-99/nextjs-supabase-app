import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { getGroupMembership } from "@/lib/groups/membership";
import { EventForm } from "@/components/events/event-form";

export default function NewEventPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">새 이벤트 만들기</h2>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <NewEventGate params={params} />
      </Suspense>
    </div>
  );
}

async function NewEventGate({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const membership = await getGroupMembership(groupId);

  if (!membership || membership.role !== "organizer") {
    notFound();
  }

  return <EventForm groupId={groupId} />;
}
