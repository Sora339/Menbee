// src/app/actions/signInGoogle.ts
"use server";

import { signIn } from "../../../auth"; // 実際のパスを合わせてください

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/myPage" });
}
