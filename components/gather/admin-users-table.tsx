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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { deleteUserAction } from "@/lib/actions/gather-admin";
import { useInfiniteScroll } from "@/lib/hooks/use-infinite-scroll";
import type { AdminUserRow, UserRole } from "@/lib/types";

const ROLE_LABEL: Record<UserRole, string> = {
  user: "일반 사용자",
  admin: "관리자",
};

const ROLE_FILTERS: Array<{ value: UserRole | "all"; label: string }> = [
  { value: "all", label: "전체" },
  { value: "user", label: "일반 사용자" },
  { value: "admin", label: "관리자" },
];

type SortKey = "createdAt" | "eventCount";

const PAGE_SIZE = 20;

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(isoDate));
}

export function AdminUsersTable({
  initialUsers,
  currentUserId,
}: {
  initialUsers: AdminUserRow[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDesc, setSortDesc] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return users
      .filter((user) =>
        roleFilter === "all" ? true : user.role === roleFilter,
      )
      .filter(
        (user) =>
          !keyword ||
          user.name.toLowerCase().includes(keyword) ||
          user.email.toLowerCase().includes(keyword),
      )
      .sort((a, b) => {
        const diff =
          sortKey === "createdAt"
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : a.eventsCreatedCount +
              a.eventsJoinedCount -
              (b.eventsCreatedCount + b.eventsJoinedCount);
        return sortDesc ? -diff : diff;
      });
  }, [users, search, roleFilter, sortKey, sortDesc]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, roleFilter, sortKey, sortDesc]);

  const visibleUsers = filtered.slice(0, visibleCount);
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

  const handleDelete = async (user: AdminUserRow) => {
    const result = await deleteUserAction(user.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    toast.success(`${user.name}님을 삭제했어요`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="이름, 이메일로 검색"
          className="max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={roleFilter}
          onValueChange={(value) => setRoleFilter(value as UserRole | "all")}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_FILTERS.map((option) => (
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
            <TableHead>사용자</TableHead>
            <TableHead>이메일</TableHead>
            <TableHead>역할</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3"
                onClick={() => toggleSort("createdAt")}
              >
                가입일 <ArrowUpDown className="size-3" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3"
                onClick={() => toggleSort("eventCount")}
              >
                생성/참여 이벤트 <ArrowUpDown className="size-3" />
              </Button>
            </TableHead>
            <TableHead className="text-right">관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visibleUsers.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-24 text-center text-muted-foreground"
              >
                조건에 맞는 사용자가 없어요
              </TableCell>
            </TableRow>
          ) : (
            visibleUsers.map((user) => {
              const isSelf = user.id === currentUserId;
              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar size="sm">
                        <AvatarImage
                          src={user.avatarUrl ?? undefined}
                          alt={user.name}
                        />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                    >
                      {ROLE_LABEL[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    {user.eventsCreatedCount} / {user.eventsJoinedCount}
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isSelf}
                          title={isSelf ? "자신은 삭제할 수 없어요" : undefined}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {user.name}님을 삭제할까요?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            삭제하면 되돌릴 수 없어요. 이 사용자가 만든 이벤트와
                            참여 기록도 함께 삭제돼요.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={() => handleDelete(user)}
                          >
                            삭제
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <div ref={sentinelRef} className="flex flex-col items-center gap-2 py-2">
        <span className="text-sm text-muted-foreground">
          {visibleUsers.length} / {filtered.length}명 표시 중
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
