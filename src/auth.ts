/**
 * auth.ts — NextAuth completo com Credentials (email + senha)
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { getPrisma } from "@/services/database/prisma";
import { isConfiguredAdminEmail, normalizeEmail } from "@/features/auth/services/adminEmails";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        const email = normalizeEmail((credentials?.email as string) ?? "");
        const password = credentials?.password as string ?? "";
        if (!email || !password) return null;

        const user = await getPrisma().user.findUnique({ where: { email } });
        if (!user || !user.password) return null;
        if (!(await bcrypt.compare(password, user.password))) return null;

        // Admin por email de ambiente OU pelo campo no banco
        const isAdmin = user.isAdmin || isConfiguredAdminEmail(email);

        return {
          id: user.id,
          email: user.email,
          name: user.name || user.email,
          isAdmin,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false;
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
});
