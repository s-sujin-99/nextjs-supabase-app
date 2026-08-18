import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getGroupMembership } from "@/lib/groups/membership";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnnouncementsPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <AnnouncementsContent params={params} />
      </Suspense>
    </div>
  );
}

async function AnnouncementsContent({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const supabase = await createClient();

  const [membership, { data: announcements }] = await Promise.all([
    getGroupMembership(groupId),
    supabase
      .from("announcements")
      .select(
        "id, title, content, created_at, profiles(full_name, username, email), events(title)",
      )
      .eq("group_id", groupId)
      .order("created_at", { ascending: false }),
  ]);

  const isOrganizer = membership?.role === "organizer";

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">공지</h2>
        {isOrganizer && (
          <Button asChild size="sm">
            <Link href={`/groups/${groupId}/announcements/new`}>새 공지</Link>
          </Button>
        )}
      </div>
      {!announcements || announcements.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          아직 공지가 없습니다
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {announcements.map((a) => {
            const author = a.profiles;
            const authorName =
              author?.full_name || author?.username || author?.email || "-";
            return (
              <Card key={a.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle>{a.title}</CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {authorName} ·{" "}
                        {new Date(a.created_at).toLocaleString("ko-KR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                          timeZone: "Asia/Seoul",
                        })}
                        {a.events && ` · ${a.events.title}`}
                      </p>
                    </div>
                    {isOrganizer && (
                      <Button asChild size="sm" variant="outline">
                        <Link
                          href={`/groups/${groupId}/announcements/${a.id}/edit`}
                        >
                          수정
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="whitespace-pre-wrap text-sm">
                  {a.content}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
