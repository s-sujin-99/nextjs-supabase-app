"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteEventAction } from "@/lib/actions/gather-events";
import { useInfiniteScroll } from "@/lib/hooks/use-infinite-scroll";
import type {
  AdminEventRow,
  EventStatus,
  StatusFilterOption,
} from "@/lib/types";

const STATUS_LABEL: Record<EventStatus, string> = {
  upcoming: "예정",
  ongoing: "진행 중",
  ended: "종료",
};

const STATUS_FILTERS: StatusFilterOption[] = [
  { value: "all", label: "전체" },
  { value: "upcoming", label: "예정" },
  { value: "ongoing", label: "진행 중" },
  { value: "ended", label: "종료" },
];

type SortKey = "eventDate" | "participantCount";

const PAGE_SIZE = 20;

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(isoDate));
}

export function AdminEventsTable({
  initialEvents,
}: {
  initialEvents: AdminEventRow[];
}) {
  const [events, setEvents] = useState(initialEvents);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilterOption["value"]>("all");
  const [sortKey, setSortKey] = useState<SortKey>("eventDate");
  const [sortDesc, setSortDesc] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return events
      .filter((event) =>
        statusFilter === "all" ? true : event.status === statusFilter,
      )
      .filter(
        (event) =>
          !keyword ||
          event.title.toLowerCase().includes(keyword) ||
          event.hostName.toLowerCase().includes(keyword),
      )
      .sort((a, b) => {
        const diff =
          sortKey === "eventDate"
            ? new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
            : a.participantCount - b.participantCount;
        return sortDesc ? -diff : diff;
      });
  }, [events, search, statusFilter, sortKey, sortDesc]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, statusFilter, sortKey, sortDesc]);

  const visibleEvents = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const sentinelRef = useInfiniteScroll(
    () => setVisibleCount((c) => c + PAGE_SIZE),
    hasMore,
  );

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDesc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  const handleDelete = async (event: AdminEventRow) => {
    const result = await deleteEventAction(event.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setEvents((prev) => prev.filter((e) => e.id !== event.id));
    toast.success(`"${event.title}" 이벤트를 삭제했어요`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="제목, 주최자로 검색"
          className="max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as StatusFilterOption["value"])
          }
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>제목</TableHead>
            <TableHead>주최자</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3"
                onClick={() => toggleSort("eventDate")}
              >
                날짜 <ArrowUpDown className="size-3" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3"
                onClick={() => toggleSort("participantCount")}
              >
                참여자 수 <ArrowUpDown className="size-3" />
              </Button>
            </TableHead>
            <TableHead>상태</TableHead>
            <TableHead>생성일</TableHead>
            <TableHead className="text-right">관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleEvents.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-24 text-center text-muted-foreground"
              >
                조건에 맞는 이벤트가 없어요
              </TableCell>
            </TableRow>
          ) : (
            visibleEvents.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.title}</TableCell>
                <TableCell>{event.hostName}</TableCell>
                <TableCell>{formatDate(event.eventDate)}</TableCell>
                <TableCell>{event.participantCount}명</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {STATUS_LABEL[event.status]}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(event.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          &quot;{event.title}&quot; 이벤트를 삭제할까요?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          삭제하면 되돌릴 수 없어요.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={() => handleDelete(event)}
                        >
                          삭제
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div ref={sentinelRef} className="flex flex-col items-center gap-2 py-2">
        <span className="text-sm text-muted-foreground">
          {visibleEvents.length} / {filtered.length}개 표시 중
        </span>
        {hasMore ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          >
            더 보기
          </Button>
        ) : null}
      </div>
    </div>
  );
}
