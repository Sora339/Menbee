import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
        token.role = (user as any).role || "user";
      }
      return token;
    },

    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          role: token.role ?? "user",
        },
      };
    },
  },
  providers: [
    Google({
      authorization: {
        params: {
          prompt: "consent", 
          access_type: "offline",
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