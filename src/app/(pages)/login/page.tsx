import LoginButton from "@/app/components/sign-in"
import type { Metadata } from "next"
import Link from "next/link"


export const metadata: Metadata = {
  title: "ログイン | Menbee",
  description: "Googleアカウントでログインして、面接日程調整を始めましょう。",
}

export default function LoginPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col items-center space-y-2 text-center text-white">
          <Link href="/" className="flex items-center mb-6">
            <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Menbee</h1>
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
  )
}
