import { Suspense } from "react";

import { MyEventsView } from "@/components/gather/my-events-view";
import { EventListSkeleton } from "@/components/gather/loading-skeleton";
import { getCurrentUserId, getMyEvents } from "@/lib/supabase/gather-queries";

async function MyEventsContent() {
  const userId = await getCurrentUserId();
  const events = userId ? await getMyEvents(userId) : [];

  return <MyEventsView initialEvents={events} />;
}

export default function MyEventsPage() {
  return (
    <Suspense fallback={<EventListSkeleton />}>
      <MyEventsContent />
    </Suspense>
  );
}
