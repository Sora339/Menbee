// app/(pages)/login/page.tsx
import React, { Suspense } from "react";
import LoginPageClient from "@/app/components/login-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ログイン | Menbee",
  description: "Googleアカウントでログインして、面接日程調整を始めましょう。",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex h-[calc(100vh-52px)] items-center justify-center">読み込み中…</div>}>
      <LoginPageClient />
    </Suspense>
  );
}
