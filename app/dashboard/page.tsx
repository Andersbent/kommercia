import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import authOptions from '@/lib/auth';
import { getSupabaseService } from '@/lib/supabase';
import DashboardClient from './DashboardClient';

/**
 * The dashboard page fetches all leads for the single authorised user and
 * passes them to the client component for rendering. We do not filter by
 * `user_id` because the Google provider's `sub` identifier is not a valid
 * UUID and cannot be compared against the `uuid` column in Postgres. In a
 * multi‑user setup you should instead add a `user_email` column or map
 * Google IDs to proper UUIDs.
 */
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/');
  }
  const supabase = getSupabaseService();
  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Failed to fetch leads', error);
  }
  return <DashboardClient initialLeads={leads ?? []} />;
}