// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt", // JWT セッションを使用
  },
  callbacks: {
    async jwt({ token, account, user }) {
      console.log("🔹 JWT Callback - account:", account);
      console.log("🔹 JWT Callback - token before update:", token);

      if (user) {
        token.user = user;
        token.role = (user as any).role || "user";
      }

      console.log("🔹 JWT Callback - token after update:", token);
      return token;
    },

    async session({ session, token }) {
      console.log("🔹 Session Callback - token:", token);

      return {
        ...session,
        user: {
          ...session.user,
          role: token.role ?? "user",
        },
        accessToken: token.accessToken ?? "",
        refreshToken: token.refreshToken ?? "",
      };
    },
  },
  providers: [
    Google({
      authorization: {
        params: {
          prompt: "consent", // 毎回同意画面を表示（リフレッシュトークンを取得）
          access_type: "offline", // オフラインアクセスを許可
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/userinfo.email",
        },
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  trustHost: true,
});

export { handlers as GET, handlers as POST };