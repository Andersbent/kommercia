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
      // Restrict access to a fixed list of email addresses
      const allowedEmails = ['andersraugbentley@gmail.com'];
      if (!user?.email || !allowedEmails.includes(user.email)) {
        // Returning false aborts the sign‑in and shows an access denied error
        return false;
      }
      // Sync authorised users into Supabase for later reference
      try {
        const supabase = getSupabaseService();
        const { error } = await supabase
          .from('users')
          .upsert({ id: user.id, name: user.name, email: user.email }, { onConflict: 'id' });
        if (error) {
          console.error('Failed to upsert user in Supabase', error);
        }
      } catch (err) {
        console.error('Failed to sync user to Supabase', err);
      }
      return true;
    },
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.NEXTAUTH_SECRET!,
};

export default authOptions;