"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyAccountButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Button type="button" size="sm" variant="outline" onClick={handleCopy}>
      {copied ? "복사됨" : "계좌 복사"}
    </Button>
  );
}
