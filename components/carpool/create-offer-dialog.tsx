"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { createOfferAction } from "@/app/(dashboard)/groups/[groupId]/events/[eventId]/carpool/actions";

export function CreateOfferDialog({
  groupId,
  eventId,
}: {
  groupId: string;
  eventId: string;
}) {
  const [open, setOpen] = useState(false);
  const [departurePoint, setDeparturePoint] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [totalSeats, setTotalSeats] = useState("3");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.set("groupId", groupId);
    formData.set("eventId", eventId);
    formData.set("departurePoint", departurePoint);
    formData.set("departureTime", departureTime);
    formData.set("totalSeats", totalSeats);
    formData.set("notes", notes);

    const result = await createOfferAction(formData);
    setIsLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }

    setOpen(false);
    setDeparturePoint("");
    setDepartureTime("");
    setTotalSeats("3");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>카풀 등록</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>카풀 등록</DialogTitle>
            <DialogDescription>
              출발지와 좌석 수를 입력하면 모임원이 탑승 신청을 할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="departurePoint">출발지</Label>
              <Input
                id="departurePoint"
                required
                maxLength={200}
                value={departurePoint}
                onChange={(e) => setDeparturePoint(e.target.value)}
                placeholder="예: 강남역 2번 출구"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="departureTime">출발 시간</Label>
                <Input
                  id="departureTime"
                  type="datetime-local"
                  required
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="totalSeats">좌석 수</Label>
                <Input
                  id="totalSeats"
                  type="number"
                  min={1}
                  max={20}
                  required
                  value={totalSeats}
                  onChange={(e) => setTotalSeats(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">메모 (선택)</Label>
              <Textarea
                id="notes"
                maxLength={300}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="예: 짐이 많으면 미리 알려주세요"
              />
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
