"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { joinEventAction } from "@/lib/actions/gather-participants";

interface JoinButtonProps {
  inviteCode: string;
  eventTitle: string;
  isLoggedIn: boolean;
}

export function JoinButton({
  inviteCode,
  eventTitle,
  isLoggedIn,
}: JoinButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/join/${inviteCode}`,
      },
    });

    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    setIsLoading(true);
    const result = await joinEventAction(inviteCode);
    setIsLoading(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    toast.success(`"${eventTitle}" 참여가 완료됐어요!`);
    router.push(`/events/${result.eventId}`);
  };

  if (!isLoggedIn) {
    return (
      <Button
        size="lg"
        className="h-12 w-full"
        disabled={isLoading}
        onClick={handleGoogleLogin}
      >
        Google로 참여하기
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      className="h-12 w-full"
      disabled={isLoading}
      onClick={handleJoin}
    >
      참여하기
    </Button>
  );
}
