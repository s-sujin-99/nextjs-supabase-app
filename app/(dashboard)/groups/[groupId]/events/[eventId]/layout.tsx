import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Skeleton } from "@/components/ui/skeleton";
import { EventNav } from "@/components/events/event-nav";

export default function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ groupId: string; eventId: string }>;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<Skeleton className="h-40 w-full" />}>
        <EventHeader params={params}>{children}</EventHeader>
      </Suspense>
    </div>
  );
}

async function EventHeader({
  params,
  children,
}: {
  params: Promise<{ groupId: string; eventId: string }>;
  children: React.ReactNode;
}) {
  const { groupId, eventId } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select(
      "title, description, location, starts_at, ends_at, is_cancelled, group_id",
    )
    .eq("id", eventId)
    .single();

  if (!event || event.group_id !== groupId) {
    notFound();
  }

  return (
    <>
      <div>
        {event.is_cancelled && (
          <p className="mb-2 text-sm font-medium text-destructive">
            이 이벤트는 취소되었습니다
          </p>
        )}
        <h1 className="text-2xl font-bold">{event.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {new Date(event.starts_at).toLocaleString("ko-KR", {
            dateStyle: "full",
            timeStyle: "short",
            timeZone: "Asia/Seoul",
          })}
          {event.ends_at &&
            ` ~ ${new Date(event.ends_at).toLocaleString("ko-KR", { timeStyle: "short", timeZone: "Asia/Seoul" })}`}
        </p>
        {event.location && (
          <p className="text-sm text-muted-foreground">{event.location}</p>
        )}
        {event.description && (
          <p className="mt-4 whitespace-pre-wrap text-sm">
            {event.description}
          </p>
        )}
      </div>
      <EventNav groupId={groupId} eventId={eventId} />
      {children}
    </>
  );
}
