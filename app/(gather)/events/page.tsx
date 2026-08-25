import { Suspense } from "react";

import { EventsView } from "@/components/gather/events-view";
import { EventListSkeleton } from "@/components/gather/loading-skeleton";
import {
  getAllEvents,
  getCurrentUserId,
  getMyEvents,
} from "@/lib/supabase/gather-queries";

async function EventsContent() {
  const userId = await getCurrentUserId();
  const [myEvents, allEvents] = await Promise.all([
    userId ? getMyEvents(userId) : Promise.resolve([]),
    getAllEvents(),
  ]);

  return <EventsView myEvents={myEvents} allEvents={allEvents} />;
}

export default function EventsPage() {
  return (
    <Suspense fallback={<EventListSkeleton />}>
      <EventsContent />
    </Suspense>
  );
}
