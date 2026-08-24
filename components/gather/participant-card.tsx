import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { ParticipantCardProps } from "@/lib/types";

const ROLE_LABEL: Record<ParticipantCardProps["participant"]["role"], string> =
  {
    host: "주최자",
    participant: "참여자",
  };

function formatJoinedAt(isoDate: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
  }).format(new Date(isoDate));
}

export function ParticipantCard({ participant }: ParticipantCardProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage
            src={participant.user.avatarUrl ?? undefined}
            alt={participant.user.name}
          />
          <AvatarFallback>{participant.user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium">{participant.user.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatJoinedAt(participant.joinedAt)} 참여
          </span>
        </div>
      </div>
      <Badge variant={participant.role === "host" ? "default" : "secondary"}>
        {ROLE_LABEL[participant.role]}
      </Badge>
    </div>
  );
}
