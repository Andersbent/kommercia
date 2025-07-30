import { redirect } from 'next/navigation';

/**
 * Default page that redirects visitors to the login screen. This allows the
 * application to present the Supabase login form instead of relying on
 * NextAuth’s Google login. Feel free to update the path if you rename
 * the login route.
 */
export default function HomePage() {
  redirect('/login');
}