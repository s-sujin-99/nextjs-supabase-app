import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaidCheckbox } from "@/components/settlements/paid-checkbox";
import { CopyAccountButton } from "@/components/settlements/copy-account-button";

type Profile = {
  full_name: string | null;
  username: string | null;
  email: string | null;
} | null;

type Settlement = {
  id: string;
  total_amount: number;
  split_method: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  created_at: string;
};

type Share = {
  id: string;
  settlement_id: string;
  user_id: string;
  amount: number;
  is_paid: boolean;
  profiles: Profile;
};

function displayName(profile: Profile) {
  return profile?.full_name || profile?.username || profile?.email || "-";
}

export function SettlementList({
  groupId,
  eventId,
  userId,
  isOrganizer,
  settlements,
  shares,
}: {
  groupId: string;
  eventId: string;
  userId: string;
  isOrganizer: boolean;
  settlements: Settlement[];
  shares: Share[];
}) {
  if (settlements.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        등록된 정산이 없습니다
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {settlements.map((settlement) => {
        const settlementShares = shares.filter(
          (share) => share.settlement_id === settlement.id,
        );
        const paidCount = settlementShares.filter((s) => s.is_paid).length;

        return (
          <Card key={settlement.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">
                    {settlement.total_amount.toLocaleString("ko-KR")}원
                  </CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {settlement.split_method === "equal"
                      ? "균등분배"
                      : "직접입력"}{" "}
                    · 정산 {paidCount}/{settlementShares.length}
                  </p>
                </div>
                <Badge
                  variant={
                    paidCount === settlementShares.length
                      ? "default"
                      : "secondary"
                  }
                >
                  {paidCount === settlementShares.length ? "완료" : "진행중"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between rounded-md border p-3 text-sm">
                <span>
                  {settlement.bank_name} {settlement.account_number} (
                  {settlement.account_holder})
                </span>
                <CopyAccountButton
                  text={`${settlement.bank_name} ${settlement.account_number} ${settlement.account_holder}`}
                />
              </div>
              <div className="flex flex-col gap-2">
                {settlementShares.map((share) => {
                  const isOwner = share.user_id === userId;
                  return (
                    <div
                      key={share.id}
                      className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm"
                    >
                      <span>{displayName(share.profiles)}</span>
                      <div className="flex items-center gap-3">
                        <span>{share.amount.toLocaleString("ko-KR")}원</span>
                        <div className="flex items-center gap-1">
                          <PaidCheckbox
                            groupId={groupId}
                            eventId={eventId}
                            shareId={share.id}
                            isPaid={share.is_paid}
                            disabled={!isOwner && !isOrganizer}
                          />
                          <span className="text-xs text-muted-foreground">
                            송금완료
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
