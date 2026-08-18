import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { GroupNav } from "@/components/groups/group-nav";
import { getGroupMembership } from "@/lib/groups/membership";

export default function GroupLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ groupId: string }>;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        <GroupAccessGate params={params}>{children}</GroupAccessGate>
      </Suspense>
    </div>
  );
}

async function GroupAccessGate({
  params,
  children,
}: {
  params: Promise<{ groupId: string }>;
  children: React.ReactNode;
}) {
  const { groupId } = await params;
  const membership = await getGroupMembership(groupId);

  if (!membership) {
    notFound();
  }

  return (
    <>
      <GroupNav groupId={groupId} />
      {children}
    </>
  );
}
