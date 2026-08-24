import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { EventCardProps } from "@/lib/types";

const STATUS_LABEL: Record<EventCardProps["event"]["status"], string> = {
  upcoming: "예정",
  ongoing: "진행 중",
  ended: "종료",
};

const STATUS_VARIANT: Record<
  EventCardProps["event"]["status"],
  "default" | "secondary" | "outline"
> = {
  upcoming: "default",
  ongoing: "secondary",
  ended: "outline",
};

function formatEventDate(isoDate: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

export function EventCard({ event, href }: EventCardProps) {
  const content = (
    <Card className="transition-colors hover:bg-accent/50">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg">{event.title}</CardTitle>
          {event.description ? (
            <CardDescription>{event.description}</CardDescription>
          ) : null}
        </div>
        <Badge variant={STATUS_VARIANT[event.status]} className="shrink-0">
          {STATUS_LABEL[event.status]}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4" />
          <span>{formatEventDate(event.eventDate)}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="size-4" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Avatar size="sm">
              <AvatarImage
                src={event.host.avatarUrl ?? undefined}
                alt={event.host.name}
              />
              <AvatarFallback>{event.host.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span>{event.host.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="size-4" />
            <span>{event.participantCount}명</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}
