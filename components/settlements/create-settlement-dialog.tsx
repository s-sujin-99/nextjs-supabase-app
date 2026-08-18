"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSettlementAction } from "@/app/(dashboard)/groups/[groupId]/events/[eventId]/settlement/actions";

type Member = { userId: string; name: string };

export function CreateSettlementDialog({
  groupId,
  eventId,
  members,
}: {
  groupId: string;
  eventId: string;
  members: Member[];
}) {
  const [open, setOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState("");
  const [splitMethod, setSplitMethod] = useState<"equal" | "custom">("equal");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(members.map((m) => m.userId)),
  );
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectedMembers = members.filter((m) => selectedIds.has(m.userId));
  const customSum = useMemo(
    () =>
      selectedMembers.reduce(
        (sum, m) => sum + (Number(customAmounts[m.userId]) || 0),
        0,
      ),
    [selectedMembers, customAmounts],
  );

  const toggleMember = (userId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const resetForm = () => {
    setTotalAmount("");
    setSplitMethod("equal");
    setBankName("");
    setAccountNumber("");
    setAccountHolder("");
    setSelectedIds(new Set(members.map((m) => m.userId)));
    setCustomAmounts({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (selectedMembers.length === 0) {
      setError("정산에 포함할 인원을 선택해주세요");
      return;
    }
    if (splitMethod === "custom" && customSum !== Number(totalAmount)) {
      setError("분배 금액의 합이 총 금액과 일치해야 합니다");
      return;
    }

    setIsLoading(true);
    const shares = selectedMembers.map((m) => ({
      userId: m.userId,
      amount:
        splitMethod === "custom" ? Number(customAmounts[m.userId]) || 0 : 0,
    }));

    const formData = new FormData();
    formData.set("groupId", groupId);
    formData.set("eventId", eventId);
    formData.set("totalAmount", totalAmount);
    formData.set("splitMethod", splitMethod);
    formData.set("bankName", bankName);
    formData.set("accountNumber", accountNumber);
    formData.set("accountHolder", accountHolder);
    formData.set("shares", JSON.stringify(shares));

    const result = await createSettlementAction(formData);
    setIsLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }

    setOpen(false);
    resetForm();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <DialogTrigger asChild>
        <Button disabled={members.length === 0}>정산 등록</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>정산 등록</DialogTitle>
            <DialogDescription>
              참석자 중 정산에 포함할 인원을 선택하고 금액을 분배합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="totalAmount">총 금액</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  min={1}
                  required
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="예: 90000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="splitMethod">분배 방식</Label>
                <Select
                  value={splitMethod}
                  onValueChange={(value) =>
                    setSplitMethod(value as "equal" | "custom")
                  }
                >
                  <SelectTrigger id="splitMethod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equal">균등분배</SelectItem>
                    <SelectItem value="custom">직접입력</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="bankName">은행명</Label>
                <Input
                  id="bankName"
                  required
                  maxLength={50}
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="예: 국민은행"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="accountNumber">계좌번호</Label>
                <Input
                  id="accountNumber"
                  required
                  maxLength={50}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="accountHolder">예금주</Label>
                <Input
                  id="accountHolder"
                  required
                  maxLength={50}
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>정산 대상 ({selectedMembers.length}명)</Label>
              <div className="flex flex-col gap-2 rounded-md border p-3">
                {members.map((member) => (
                  <div
                    key={member.userId}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedIds.has(member.userId)}
                        onCheckedChange={() => toggleMember(member.userId)}
                      />
                      <span className="text-sm">{member.name}</span>
                    </div>
                    {splitMethod === "custom" &&
                      selectedIds.has(member.userId) && (
                        <Input
                          type="number"
                          min={0}
                          className="w-28"
                          value={customAmounts[member.userId] ?? ""}
                          onChange={(e) =>
                            setCustomAmounts((prev) => ({
                              ...prev,
                              [member.userId]: e.target.value,
                            }))
                          }
                          placeholder="금액"
                        />
                      )}
                  </div>
                ))}
              </div>
              {splitMethod === "custom" && (
                <p className="text-xs text-muted-foreground">
                  분배 합계 {customSum.toLocaleString("ko-KR")}원 / 총 금액{" "}
                  {(Number(totalAmount) || 0).toLocaleString("ko-KR")}원
                </p>
              )}
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "등록 중..." : "등록"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
