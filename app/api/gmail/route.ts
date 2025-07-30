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
      const userEmail = (session.user as any).email as string | undefined;
      const supabase = getSupabaseService();
      // Fetch all leads with email addresses. We do not filter by user_id
      // because the Google provider's `sub` identifier is not a valid UUID.
      // In a multi‑user setup consider filtering by a dedicated `user_email` field.
      const { data: leads } = await supabase
        .from('leads')
        .select('id, email, response_status');
  if (!leads || leads.length === 0) {
    return NextResponse.json({ updated: false, reason: 'No leads' });
  }
  // Fetch recent messages from Gmail. We limit to the last 50 messages to
  // avoid hitting rate limits. Consider using pagination for larger
  // inboxes.
  const messages = await fetchRecentMessages(50);
  const now = new Date();
  // We'll accumulate updates keyed by lead id to avoid updating the same
  // lead multiple times within the loop. The most recent message wins.
  const updates: Record<string, { last_contact_date: string; most_recent_subject: string | null; response_status: string }> = {};
  for (const msg of messages) {
    const headers = msg.payload?.headers ?? [];
    const from = headers.find((h) => h.name === 'From')?.value;
    const to = headers.find((h) => h.name === 'To')?.value;
    const subject = headers.find((h) => h.name === 'Subject')?.value ?? null;
    const dateStr = headers.find((h) => h.name === 'Date')?.value;
    const messageDate = dateStr ? new Date(dateStr) : now;
    const fromAddress = extractEmailAddress(from || '')?.toLowerCase();
    const toAddress = extractEmailAddress(to || '')?.toLowerCase();
    // Determine which lead this message relates to, if any
    const lead = leads.find(
      (l) => (l.email && l.email.toLowerCase() === fromAddress) || (l.email && l.email.toLowerCase() === toAddress)
    );
    if (!lead) continue;
    // Determine the response status. If the lead is the sender we
    // consider it a "responded" message. If the lead is the
    // recipient then the user has sent a message and we mark it as
    // "sent". Otherwise we leave the status unchanged.
    let status = lead.response_status || 'none';
    if (fromAddress && lead.email && lead.email.toLowerCase() === fromAddress) {
      status = 'responded';
    } else if (
      toAddress &&
      lead.email &&
      lead.email.toLowerCase() === toAddress &&
      userEmail &&
      fromAddress &&
      fromAddress === userEmail.toLowerCase()
    ) {
      // User sent an email to the lead
      status = status === 'responded' ? 'responded' : 'sent';
    }
    updates[lead.id] = {
      last_contact_date: messageDate.toISOString(),
      most_recent_subject: subject,
      response_status: status,
    };
  }
  // Perform bulk updates in parallel
  const updatePromises = Object.entries(updates).map(([id, update]) =>
    supabase
      .from('leads')
      .update(update)
      .eq('id', id)
  );
  await Promise.all(updatePromises);
  return NextResponse.json({ updated: true, count: updatePromises.length });
}