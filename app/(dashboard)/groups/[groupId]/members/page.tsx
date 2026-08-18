import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function MembersPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">멤버</h2>
      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
        <MemberList params={params} />
      </Suspense>
    </div>
  );
}

async function MemberList({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("group_members")
    .select("role, joined_at, profiles(full_name, username, email)")
    .eq("group_id", groupId)
    .order("joined_at", { ascending: true });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>이름</TableHead>
          <TableHead>역할</TableHead>
          <TableHead>가입일</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members?.map((member, i) => {
          const profile = member.profiles;
          const displayName =
            profile?.full_name || profile?.username || profile?.email || "-";
          return (
            <TableRow key={i}>
              <TableCell>{displayName}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    member.role === "organizer" ? "default" : "secondary"
                  }
                >
                  {member.role === "organizer" ? "주최자" : "멤버"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(member.joined_at).toLocaleDateString("ko-KR")}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
