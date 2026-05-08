/**
 * Auth.js v5 root. Exports `auth`, `signIn`, `signOut`, and the route
 * handlers used by app/api/auth/[...nextauth]/route.ts.
 *
 * The PrismaAdapter is wired but inert when DATABASE_URL is missing —
 * Auth.js will fall back to JWT-only sessions. That keeps the build green
 * even before the DB is provisioned.
 */
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { buildProviders } from "@/lib/auth-providers";

const hasDatabase = Boolean(process.env.DATABASE_URL);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: hasDatabase ? PrismaAdapter(prisma) : undefined,
  providers: buildProviders(),
  session: { strategy: hasDatabase ? "database" : "jwt" },
  pages: {
    // Use the in-app modal rather than Auth.js's default sign-in page.
    signIn: "/?signin=1",
  },
  callbacks: {
    async session({ session, user, token }) {
      if (session.user) {
        session.user.id = (user?.id ?? token?.sub) as string;
        // Surface username so client components can deep-link to /u/[username]
        if (user && "username" in user) {
          (session.user as { username?: string | null }).username =
            (user as { username?: string | null }).username ?? null;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
  },
  trustHost: true,
});
