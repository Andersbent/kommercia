import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import { getSupabaseService } from '@/lib/supabase';
import { fetchRecentMessages, extractEmailAddress } from '@/lib/gmail';

/**
 * GET /api/gmail
 *
 * This endpoint synchronises recent Gmail messages with the user's leads.
 * It reads the latest emails via the Gmail API, matches them to leads based
 * on email addresses and updates the `last_contact_date`,
 * `most_recent_subject` and a simple `response_status` in the Supabase `leads` table.
 * Only authenticated users can access this endpoint.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id;
  const supabase = getSupabaseService();
  // Fetch the current user's leads with email addresses
  const { data: leads } = await supabase
    .from('leads')
    .select('id, email')
    .eq('user_id', userId);
  if (!leads || leads.length === 0) {
    return NextResponse.json({ updated: false, reason: 'No leads' });
  }
  // Fetch recent messages from Gmail
  const messages = await fetchRecentMessages(50);
  const now = new Date();
  for (const msg of messages) {
    const headers = msg.payload?.headers ?? [];
    const from = headers.find((h) => h.name === 'From')?.value;
    const to = headers.find((h) => h.name === 'To')?.value;
    const subject = headers.find((h) => h.name === 'Subject')?.value;
    const dateStr = headers.find((h) => h.name === 'Date')?.value;
    const messageDate = dateStr ? new Date(dateStr) : now;
    const address = extractEmailAddress(from || '') ?? extractEmailAddress(to || '');
    if (!address) continue;
    const lead = leads.find((l) => l.email && l.email.toLowerCase() === address.toLowerCase());
    if (lead) {
      await supabase
        .from('leads')
        .update({
          last_contact_date: messageDate.toISOString(),
          most_recent_subject: subject ?? null,
          response_status: 'responded',
        })
        .eq('id', lead.id);
    }
  }
  return NextResponse.json({ updated: true });
}