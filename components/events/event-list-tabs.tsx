"use client";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type EventRow = {
  id: string;
  title: string;
  starts_at: string;
  location: string | null;
  is_cancelled: boolean;
};

export function EventListTabs({
  groupId,
  events,
}: {
  groupId: string;
  events: EventRow[];
}) {
  const now = Date.now();
  const upcoming = events.filter((e) => new Date(e.starts_at).getTime() >= now);
  const past = events
    .filter((e) => new Date(e.starts_at).getTime() < now)
    .reverse();

  return (
    <Tabs defaultValue="upcoming">
      <TabsList>
        <TabsTrigger value="upcoming">예정 ({upcoming.length})</TabsTrigger>
        <TabsTrigger value="past">지난 ({past.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="upcoming" className="flex flex-col gap-3">
        <EventList
          groupId={groupId}
          events={upcoming}
          emptyText="예정된 이벤트가 없습니다"
        />
      </TabsContent>
      <TabsContent value="past" className="flex flex-col gap-3">
        <EventList
          groupId={groupId}
          events={past}
          emptyText="지난 이벤트가 없습니다"
        />
      </TabsContent>
    </Tabs>
  );
}

function EventList({
  groupId,
  events,
  emptyText,
}: {
  groupId: string;
  events: EventRow[];
  emptyText: string;
}) {
  if (events.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  return (
    <>
      {events.map((event) => (
        <Link key={event.id} href={`/groups/${groupId}/events/${event.id}`}>
          <Card className="transition-colors hover:bg-accent">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{event.title}</CardTitle>
                {event.is_cancelled && (
                  <Badge variant="secondary">취소됨</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
              <span>
                {new Date(event.starts_at).toLocaleString("ko-KR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Asia/Seoul",
                })}
              </span>
              {event.location && <span>{event.location}</span>}
            </CardContent>
          </Card>
        </Link>
      ))}
    </>
  );
}
