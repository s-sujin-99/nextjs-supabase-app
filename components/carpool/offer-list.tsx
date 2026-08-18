import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RequestSeatButton } from "@/components/carpool/request-seat-button";
import { RespondButtons } from "@/components/carpool/respond-buttons";

type Profile = {
  full_name: string | null;
  username: string | null;
  email: string | null;
} | null;

type Offer = {
  id: string;
  departure_point: string;
  departure_time: string;
  total_seats: number;
  notes: string | null;
  driver_id: string;
  profiles: Profile;
};

type CarpoolRequest = {
  id: string;
  offer_id: string;
  passenger_id: string;
  status: string;
  profiles: Profile;
};

const STATUS_LABEL: Record<string, string> = {
  requested: "대기중",
  approved: "승인됨",
  declined: "거절됨",
  cancelled: "취소됨",
};

function displayName(profile: Profile) {
  return profile?.full_name || profile?.username || profile?.email || "-";
}

export function OfferList({
  groupId,
  eventId,
  userId,
  offers,
  requests,
}: {
  groupId: string;
  eventId: string;
  userId: string;
  offers: Offer[];
  requests: CarpoolRequest[];
}) {
  if (offers.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        등록된 카풀이 없습니다
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {offers.map((offer) => {
        const offerRequests = requests.filter((r) => r.offer_id === offer.id);
        const approvedCount = offerRequests.filter(
          (r) => r.status === "approved",
        ).length;
        const isDriver = offer.driver_id === userId;
        const myRequest = offerRequests.find((r) => r.passenger_id === userId);

        return (
          <Card key={offer.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">
                    {offer.departure_point}
                  </CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    운전자 {displayName(offer.profiles)} ·{" "}
                    {new Date(offer.departure_time).toLocaleString("ko-KR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Asia/Seoul",
                    })}{" "}
                    · 좌석 {approvedCount}/{offer.total_seats}
                  </p>
                </div>
                {!isDriver &&
                  (myRequest ? (
                    <Badge
                      variant={
                        myRequest.status === "approved"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {STATUS_LABEL[myRequest.status] ?? myRequest.status}
                    </Badge>
                  ) : (
                    <RequestSeatButton
                      groupId={groupId}
                      eventId={eventId}
                      offerId={offer.id}
                    />
                  ))}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {offer.notes && (
                <p className="text-sm text-muted-foreground">{offer.notes}</p>
              )}
              {isDriver && (
                <div className="flex flex-col gap-2">
                  {offerRequests.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      아직 신청자가 없습니다
                    </p>
                  ) : (
                    offerRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm"
                      >
                        <span>{displayName(request.profiles)}</span>
                        {request.status === "requested" ? (
                          <RespondButtons
                            groupId={groupId}
                            eventId={eventId}
                            offerId={offer.id}
                            requestId={request.id}
                          />
                        ) : (
                          <Badge
                            variant={
                              request.status === "approved"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {STATUS_LABEL[request.status] ?? request.status}
                          </Badge>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
