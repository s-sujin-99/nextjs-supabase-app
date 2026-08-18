import { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGroupMembership } from "@/lib/groups/membership";
import { Skeleton } from "@/components/ui/skeleton";
import { InviteCodeCard } from "@/components/groups/invite-code-card";

export default function GroupHomePage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  return (
    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
      <GroupHome params={params} />
    </Suspense>
  );
}

async function GroupHome({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const supabase = await createClient();

  const [{ data: group }, membership, { count: memberCount }] =
    await Promise.all([
      supabase
        .from("groups")
        .select("name, description, invite_code")
        .eq("id", groupId)
        .single(),
      getGroupMembership(groupId),
      supabase
        .from("group_members")
        .select("*", { count: "exact", head: true })
        .eq("group_id", groupId),
    ]);

  if (!group || !membership) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">{group.name}</h1>
        {group.description && (
          <p className="mt-2 text-sm text-muted-foreground">
            {group.description}
          </p>
        )}
        <p className="mt-1 text-sm text-muted-foreground">
          멤버 {memberCount ?? 0}명
        </p>
      </div>
      {membership.role === "organizer" && (
        <InviteCodeCard inviteCode={group.invite_code} />
      )}
    </div>
  );
}
