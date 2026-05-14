/**
 * auth.config.ts — Config edge-safe (sem DB, sem bcrypt)
 * Usado pelo proxy (Edge Runtime).
 */

import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [], // Credentials é adicionado em auth.ts (Node.js)
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      if (pathname === "/login") return true;
      if (pathname.startsWith("/api/auth")) return true;
      if (!isLoggedIn) return false;

      if (pathname.startsWith("/admin") && !auth.user?.isAdmin) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin ?? false;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isAdmin = (token.isAdmin ?? false) as boolean;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
};
