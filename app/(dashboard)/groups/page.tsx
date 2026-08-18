import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateGroupDialog } from "@/components/groups/create-group-dialog";
import { JoinGroupDialog } from "@/components/groups/join-group-dialog";

export default function GroupsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">내 모임</h1>
        <div className="flex gap-2">
          <JoinGroupDialog />
          <CreateGroupDialog />
        </div>
      </div>
      <Suspense fallback={<GroupListSkeleton />}>
        <GroupList />
      </Suspense>
    </div>
  );
}

async function GroupList() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub;

  const { data } = await supabase
    .from("group_members")
    .select("role, groups(id, name, description)")
    .eq("user_id", userId ?? "")
    .order("joined_at", { ascending: false });

  if (!data || data.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        아직 참여한 모임이 없습니다. 새 모임을 만들거나 초대 코드로
        참여해보세요.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {data.map((membership) => {
        const group = membership.groups;
        if (!group) return null;
        return (
          <Link key={group.id} href={`/groups/${group.id}`}>
            <Card className="h-full transition-colors hover:bg-accent">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{group.name}</CardTitle>
                  <Badge
                    variant={
                      membership.role === "organizer" ? "default" : "secondary"
                    }
                  >
                    {membership.role === "organizer" ? "주최자" : "멤버"}
                  </Badge>
                </div>
              </CardHeader>
              {group.description && (
                <CardContent className="text-sm text-muted-foreground">
                  {group.description}
                </CardContent>
              )}
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

function GroupListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
