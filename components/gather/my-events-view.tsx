"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/gather/event-card";
import { EmptyState } from "@/components/gather/empty-state";
import type { EventWithParticipants, StatusFilterOption } from "@/lib/types";

const FILTER_OPTIONS: StatusFilterOption[] = [
  { value: "all", label: "전체" },
  { value: "upcoming", label: "예정" },
  { value: "ongoing", label: "진행 중" },
  { value: "ended", label: "종료" },
];

export function MyEventsView({
  initialEvents,
}: {
  initialEvents: EventWithParticipants[];
}) {
  const [filter, setFilter] = useState<StatusFilterOption["value"]>("all");

  const filteredEvents = useMemo(
    () =>
      filter === "all"
        ? initialEvents
        : initialEvents.filter((event) => event.status === filter),
    [initialEvents, filter],
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">내 이벤트</h1>

      <Tabs
        value={filter}
        onValueChange={(value) =>
          setFilter(value as StatusFilterOption["value"])
        }
      >
        <TabsList>
          {FILTER_OPTIONS.map((option) => (
            <TabsTrigger key={option.value} value={option.value}>
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {filteredEvents.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              href={`/events/${event.id}`}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="표시할 이벤트가 없어요"
          description="새 이벤트를 만들어 참여자를 초대해보세요."
          action={
            <Button asChild>
              <Link href="/events/new">
                <Plus /> 새 이벤트 만들기
              </Link>
            </Button>
          }
        />
      )}

      <Button
        asChild
        size="icon"
        className="fixed bottom-24 right-5 size-14 rounded-full shadow-lg sm:bottom-8"
      >
        <Link href="/events/new" aria-label="새 이벤트 만들기">
          <Plus className="size-6" />
        </Link>
      </Button>
    </div>
  );
}
