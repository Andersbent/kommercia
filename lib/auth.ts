import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthOptions } from 'next-auth';
import { getSupabaseService } from './supabase';

/**
 * NextAuth configuration for Kommercia.
 *
 * This version introduces an email whitelist to restrict access during the MVP
 * phase. Only users whose email addresses appear in the `allowedEmails` array
 * will be allowed to sign in. All other login attempts will be rejected
 * immediately. If the sign‑in succeeds, the user's details are upserted in
 * Supabase to keep the `users` table in sync.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
      }
      return session;
    },
    async signIn({ user }) {
      // Restrict access to a fixed list of email addresses.
      // Only the whitelisted email addresses are allowed to sign in during the MVP phase.
      const allowedEmails = ['andersraugbentley@gmail.com'];
      if (!user?.email || !allowedEmails.includes(user.email)) {
        // Returning false aborts the sign‑in and shows an access denied error.
        return false;
      }
      /*
       * Previously we attempted to upsert the authenticated user into a "users" table.
       * However, the Google provider's `sub` identifier is a long numeric string which
       * is not a valid UUID. Attempting to insert it into a `uuid` column caused
       * Postgres errors such as "invalid input syntax for type uuid". For the current
       * single‑user MVP there is no need to persist user records, so we simply return
       * true here without writing to the database. In a multi‑user environment you
       * should either map external IDs to UUIDs or store the user email instead.
       */
      return true;
    },
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.NEXTAUTH_SECRET!,
};

export default authOptions;