import { google } from 'googleapis';

/**
 * Returns an authenticated Gmail client using OAuth2 credentials stored in env vars.
 * Requires the following env vars:
 * - GMAIL_CLIENT_ID
 * - GMAIL_CLIENT_SECRET
 * - GMAIL_REDIRECT_URI
 * - GMAIL_REFRESH_TOKEN
 */
export async function getGmailClient() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const redirectUri = process.env.GMAIL_REDIRECT_URI;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken || !redirectUri) {
    throw new Error('Missing Gmail OAuth configuration');
  }
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return google.gmail({ version: 'v1', auth: oauth2Client });
}

/**
 * Fetches recent messages from the user's inbox.
 * Returns message metadata (From, To, Subject, Date) for up to `maxResults` emails.
 */
export async function fetchRecentMessages(maxResults = 20) {
  const gmail = await getGmailClient();
  const res = await gmail.users.messages.list({ userId: 'me', maxResults });
  const messages = res.data.messages ?? [];
  const metadata = await Promise.all(
    messages.map((m) =>
      gmail.users.messages.get({
        userId: 'me',
        id: m.id!,
        format: 'metadata',
        metadataHeaders: ['From', 'To', 'Subject', 'Date']
      })
    )
  );
  return metadata.map((res) => res.data);
}

/**
 * Extracts the email address from a "Name <email@example.com>" string.
 */
export function extractEmailAddress(headerValue: string | undefined): string | null {
  if (!headerValue) return null;
  const match = headerValue.match(/<([^>]+)>/);
  return match ? match[1] : headerValue;
}

/**
 * Matches recent emails with leads based on email address.
 * Updates last contact date and notes via Supabase service client.
 */
export async function syncEmailsWithLeads(leads: { id: string; email?: string | null }[], updateLead: (id: string, data: any) => Promise<void>) {
  const messages = await fetchRecentMessages();
  const now = new Date();
  for (const msg of messages) {
    const headers = msg.payload?.headers ?? [];
    const from = headers.find((h) => h.name === 'From')?.value;
    const to = headers.find((h) => h.name === 'To')?.value;
    const dateStr = headers.find((h) => h.name === 'Date')?.value;
    const messageDate = dateStr ? new Date(dateStr) : now;
    const email = extractEmailAddress(from || '') ?? extractEmailAddress(to || '');
    if (!email) continue;
    const lead = leads.find((l) => l.email && l.email.toLowerCase() === email.toLowerCase());
    if (lead) {
      await updateLead(lead.id, {
        last_contact_date: messageDate.toISOString(),
        notes: `Automatisk notifikation: ny email modtaget den ${messageDate.toISOString()}`
      });
    }
  }
}
