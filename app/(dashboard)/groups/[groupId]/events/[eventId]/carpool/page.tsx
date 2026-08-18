import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateOfferDialog } from "@/components/carpool/create-offer-dialog";
import { OfferList } from "@/components/carpool/offer-list";

export default function CarpoolPage({
  params,
}: {
  params: Promise<{ groupId: string; eventId: string }>;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <CarpoolContent params={params} />
      </Suspense>
    </div>
  );
}

async function CarpoolContent({
  params,
}: {
  params: Promise<{ groupId: string; eventId: string }>;
}) {
  const { groupId, eventId } = await params;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub ?? "";

  const { data: offers } = await supabase
    .from("carpool_offers")
    .select(
      "id, departure_point, departure_time, total_seats, notes, driver_id, profiles(full_name, username, email)",
    )
    .eq("event_id", eventId)
    .order("departure_time", { ascending: true });

  const offerIds = (offers ?? []).map((o) => o.id);
  const { data: requests } =
    offerIds.length > 0
      ? await supabase
          .from("carpool_requests")
          .select(
            "id, offer_id, passenger_id, status, profiles(full_name, username, email)",
          )
          .in("offer_id", offerIds)
      : { data: [] };

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">카풀</h2>
        <CreateOfferDialog groupId={groupId} eventId={eventId} />
      </div>
      <OfferList
        groupId={groupId}
        eventId={eventId}
        userId={userId}
        offers={offers ?? []}
        requests={requests ?? []}
      />
    </>
  );
}
