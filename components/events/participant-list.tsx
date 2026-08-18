import { createClient } from "@/lib/supabase/server";

type Row = { userId: string; name: string };

export async function ParticipantList({
  groupId,
  eventId,
}: {
  groupId: string;
  eventId: string;
}) {
  const supabase = await createClient();

  const [{ data: members }, { data: rsvps }] = await Promise.all([
    supabase
      .from("group_members")
      .select("user_id, profiles(full_name, username, email)")
      .eq("group_id", groupId),
    supabase
      .from("event_rsvps")
      .select("user_id, status")
      .eq("event_id", eventId),
  ]);

  const statusByUser = new Map((rsvps ?? []).map((r) => [r.user_id, r.status]));

  const rows = (members ?? []).map((member) => {
    const profile = member.profiles;
    return {
      userId: member.user_id,
      name: profile?.full_name || profile?.username || profile?.email || "-",
      status: statusByUser.get(member.user_id) ?? "pending",
    };
  });

  const attending = rows.filter((r) => r.status === "attending");
  const notAttending = rows.filter((r) => r.status === "not_attending");
  const pending = rows.filter((r) => r.status === "pending");

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">
        참석자 ({attending.length}/{rows.length})
      </h3>
      <div className="grid gap-4 sm:grid-cols-3">
        <ParticipantGroup title="참석" rows={attending} />
        <ParticipantGroup title="불참" rows={notAttending} />
        <ParticipantGroup title="미정" rows={pending} />
      </div>
    </div>
  );
}

function ParticipantGroup({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <div className="rounded-md border p-3">
      <h4 className="mb-2 text-sm font-medium text-muted-foreground">
        {title} ({rows.length})
      </h4>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">-</p>
      ) : (
        <ul className="flex flex-col gap-1 text-sm">
          {rows.map((r) => (
            <li key={r.userId}>{r.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
