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
  // On the server we use the service role to fetch all leads. In a single‑user
  // setup this is acceptable and avoids reliance on NextAuth. If row‑level
  // security is enabled you may need to adjust policies accordingly.
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