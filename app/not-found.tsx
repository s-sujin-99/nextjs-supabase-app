import Link from "next/link";
import { CompassIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <CompassIcon className="size-8 text-muted-foreground" />
          <CardTitle>페이지를 찾을 수 없어요</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-center text-sm text-muted-foreground">
            주소가 잘못됐거나 삭제된 페이지예요.
          </p>
          <Button className="h-12" asChild>
            <Link href="/">홈으로 가기</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
