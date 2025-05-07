// app/login/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import LoginButton from "@/app/components/sign-in";

export const metadata: Metadata = {
  title: "ログイン | Menbee",
  description: "Googleアカウントでログインして、面接日程調整を始めましょう。",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const error = searchParams.error;
  
  return (
    <div className="flex h-[calc(100vh-52px)] flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        {error === "token_expired" && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>再認証が必要です</AlertTitle>
            <AlertDescription>
              Googleとの認証情報が期限切れになりました。再度ログインしてください。
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col items-center space-y-2 text-center text-white">
          <Link href="/" className="flex items-center mb-6">
            <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">Menbee</h1>
          </Link>

          <h2 className="text-xl font-semibold tracking-tight">面接日程調整サービス</h2>
          <p className="text-sm text-muted-foreground">Googleカレンダーと連携して最適な面接日程を提案</p>
        </div>

        <div className="grid gap-6">
          <div className="text-center">
            <LoginButton />
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <p>
              ログインすることで、
              <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                利用規約
              </Link>
              と
              <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                プライバシーポリシー
              </Link>
              に同意したことになります。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}