import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getGroupMembership } from "@/lib/groups/membership";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateSettlementDialog } from "@/components/settlements/create-settlement-dialog";
import { SettlementList } from "@/components/settlements/settlement-list";

export default function SettlementPage({
  params,
}: {
  params: Promise<{ groupId: string; eventId: string }>;
}) {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <SettlementContent params={params} />
    </Suspense>
  );
}

async function SettlementContent({
  params,
}: {
  params: Promise<{ groupId: string; eventId: string }>;
}) {
  const { groupId, eventId } = await params;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub ?? "";
  const membership = await getGroupMembership(groupId);
  const isOrganizer = membership?.role === "organizer";

  const [{ data: members }, { data: rsvps }, { data: settlements }] =
    await Promise.all([
      supabase
        .from("group_members")
        .select("user_id, profiles(full_name, username, email)")
        .eq("group_id", groupId),
      supabase
        .from("event_rsvps")
        .select("user_id, status")
        .eq("event_id", eventId),
      supabase
        .from("settlements")
        .select(
          "id, total_amount, split_method, bank_name, account_number, account_holder, created_at",
        )
        .eq("event_id", eventId)
        .order("created_at", { ascending: false }),
    ]);

  const attendingStatus = new Map(
    (rsvps ?? []).map((rsvp) => [rsvp.user_id, rsvp.status]),
  );
  const attendingMembers = (members ?? [])
    .filter((member) => attendingStatus.get(member.user_id) === "attending")
    .map((member) => ({
      userId: member.user_id,
      name:
        member.profiles?.full_name ||
        member.profiles?.username ||
        member.profiles?.email ||
        "-",
    }));

  const settlementIds = (settlements ?? []).map((s) => s.id);
  const { data: shares } =
    settlementIds.length > 0
      ? await supabase
          .from("settlement_shares")
          .select(
            "id, settlement_id, user_id, amount, is_paid, profiles(full_name, username, email)",
          )
          .in("settlement_id", settlementIds)
      : { data: [] };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">정산</h2>
        {isOrganizer && (
          <CreateSettlementDialog
            groupId={groupId}
            eventId={eventId}
            members={attendingMembers}
          />
        )}
      </div>
      <SettlementList
        groupId={groupId}
        eventId={eventId}
        userId={userId}
        isOrganizer={isOrganizer}
        settlements={settlements ?? []}
        shares={shares ?? []}
      />
    </div>
  );
}
