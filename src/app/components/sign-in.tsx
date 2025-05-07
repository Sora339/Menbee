// src/app/components/sign-in.tsx
"use client";

import Image from "next/image";
import { signInWithGoogle } from "@/app/actions/signInGoogle";

export default function LoginButton() {
  return (
    <form action={signInWithGoogle}>
      <button type="submit" className="w-fit">
        <Image
          src="/image/login.svg"   // 必要に応じてパスを先頭にスラッシュ付けてください
          alt="google"
          width={200}
          height={40}
          className="rounded-full"
        />
      </button>
    </form>
  );
}
