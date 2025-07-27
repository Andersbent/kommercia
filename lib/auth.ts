import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthOptions } from 'next-auth';
import { getSupabaseService } from './supabase';

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
        // expose the Supabase user ID on the session
        (session.user as any).id = token.sub;
      }
      return session;
    },
    async signIn({ user }) {
      // Ensure the user exists in the leads system (e.g. create record in Supabase)
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
  secret: process.env.NEXTAUTH_SECRET,
};
